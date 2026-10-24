// User defined symbols in XC=BASIC 3 source: SUB, FUNCTION, TYPE (with fields), CONST and labels.
// Pure text processing (no LSP / VS Code imports) so it can be unit tested with plain Node.

import { KEYWORDS, FUNCTIONS, DATA_TYPES } from './xcbasic3-builtins';

export type SymbolKindName = 'sub' | 'function' | 'type' | 'field' | 'const' | 'label';

export interface SourceSymbol {
  name: string;
  kind: SymbolKindName;
  /** Signature / value shown next to the name, e.g. "(x AS INT) AS BYTE" or "= 53280". */
  detail?: string;
  /** The source line of the definition (0-based) and the name's character range on it. */
  line: number;
  startChar: number;
  endChar: number;
  /** Last line of the block (END SUB / END FUNCTION / END TYPE), same as `line` for one-liners. */
  endLine: number;
  endLineLength: number;
  /** DECLARE SUB / DECLARE FUNCTION: a forward declaration, not the body. */
  declaration?: boolean;
  children?: SourceSymbol[];
}

const IDENT = '[A-Za-z_][A-Za-z0-9_]*';
// Group 1 of each pattern is the text before the name, so the name starts at m[1].length.
const RE_SUB = new RegExp(`^(\\s*(DECLARE\\s+)?SUB\\s+)(${IDENT})\\b(.*)$`, 'i');
const RE_FUNCTION = new RegExp(`^(\\s*(DECLARE\\s+)?FUNCTION\\s+)(${IDENT})\\b(.*)$`, 'i');
const RE_TYPE = new RegExp(`^(\\s*TYPE\\s+)(${IDENT})\\b`, 'i');
const RE_CONST = new RegExp(`^(\\s*CONST\\s+)(${IDENT})\\s*=\\s*(.*)$`, 'i');
const RE_FIELD = new RegExp(`^(\\s*)(${IDENT})\\s+AS\\s+(${IDENT}(?:\\s*\\*\\s*\\d+)?)`, 'i');
const RE_LABEL = new RegExp(`^(\\s*)(${IDENT}):`);
const RE_END = /^\s*END\s+(SUB|FUNCTION|TYPE|ASM)\b/i;
const RE_ASM = /^\s*ASM\b/i;
const RE_INCLUDE = /^\s*INCLUDE\s+"([^"]+)"/i;

const RESERVED = new Set<string>([
  ...KEYWORDS.map(k => k.name),
  ...FUNCTIONS.map(f => f.name),
  ...DATA_TYPES
].map(n => n.toUpperCase()));

/** Remove a trailing ' or REM comment, leaving string literals intact. */
export function stripComment(line: string): string {
  let inString = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inString = !inString;
    } else if (!inString) {
      if (ch === "'") return line.slice(0, i);
      if ((ch === 'R' || ch === 'r') && /^REM\b/i.test(line.slice(i)) && (i === 0 || /[\s:]/.test(line[i - 1]))) {
        return line.slice(0, i);
      }
    }
  }
  return line;
}

/** "(a AS INT, b AS INT) AS BYTE STATIC" -> "(a AS INT, b AS INT) AS BYTE" */
function signature(rest: string): string {
  const text = stripComment(rest).trim();
  const params = /\(([^)]*)\)/.exec(text);
  const returns = /\bAS\s+([A-Za-z_][A-Za-z0-9_]*(?:\s*\*\s*\d+)?)/i.exec(text.replace(/\([^)]*\)/, ''));
  const parts: string[] = [];
  if (params) parts.push(`(${params[1].trim()})`);
  if (returns) parts.push(`AS ${returns[1].replace(/\s+/g, ' ')}`);
  return parts.join(' ');
}

/** Parse one source file. Lines inside ASM ... END ASM are ignored. */
export function parseSymbols(text: string): SourceSymbol[] {
  const lines = text.split(/\r?\n/);
  const result: SourceSymbol[] = [];
  let open: SourceSymbol | undefined;
  let inAsm = false;

  const make = (name: string, kind: SymbolKindName, line: number, raw: string, startChar: number, detail?: string): SourceSymbol => ({
    name,
    kind,
    detail,
    line,
    startChar,
    endChar: startChar + name.length,
    endLine: line,
    endLineLength: raw.length
  });

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const end = RE_END.exec(raw);
    if (inAsm) {
      if (end && end[1].toUpperCase() === 'ASM') inAsm = false;
      continue;
    }
    if (RE_ASM.test(raw)) {
      inAsm = true;
      continue;
    }
    if (end) {
      if (open && open.kind === end[1].toLowerCase()) {
        open.endLine = i;
        open.endLineLength = raw.length;
        open = undefined;
      }
      continue;
    }

    let m: RegExpExecArray | null;
    if ((m = RE_SUB.exec(raw)) || (m = RE_FUNCTION.exec(raw))) {
      const kind: SymbolKindName = /SUB\s*$/i.test(m[1]) ? 'sub' : 'function';
      const sym = make(m[3], kind, i, raw, m[1].length, signature(m[4]) || undefined);
      if (m[2]) sym.declaration = true;
      else open = sym;
      result.push(sym);
    } else if ((m = RE_TYPE.exec(raw))) {
      const sym = make(m[2], 'type', i, raw, m[1].length);
      sym.children = [];
      open = sym;
      result.push(sym);
    } else if ((m = RE_CONST.exec(raw))) {
      const value = stripComment(m[3]).trim();
      result.push(make(m[2], 'const', i, raw, m[1].length, value ? `= ${value}` : undefined));
    } else if (open?.kind === 'type' && (m = RE_FIELD.exec(raw))) {
      open.children!.push(make(m[2], 'field', i, raw, m[1].length, `AS ${m[3].replace(/\s+/g, ' ')}`));
    } else if ((m = RE_LABEL.exec(raw)) && !RESERVED.has(m[2].toUpperCase())) {
      result.push(make(m[2], 'label', i, raw, m[1].length));
    }
  }
  return result;
}

/** Files pulled in with INCLUDE "name", with the line of the statement. Paths are as written (relative to the file). */
export function findIncludes(text: string): { path: string; line: number }[] {
  const out: { path: string; line: number }[] = [];
  text.split(/\r?\n/).forEach((raw, line) => {
    const m = RE_INCLUDE.exec(raw);
    if (m) out.push({ path: m[1], line });
  });
  return out;
}

/** Symbols named `name` (case-insensitive). Bodies win over DECLARE lines; TYPE fields are not matched. */
export function findDefinitions(symbols: SourceSymbol[], name: string): SourceSymbol[] {
  const upper = name.toUpperCase();
  const hits = symbols.filter(s => s.name.toUpperCase() === upper);
  const bodies = hits.filter(s => !s.declaration);
  return bodies.length ? bodies : hits;
}

/** The identifier under `offset`, or undefined when the cursor is not on one. */
export function wordAt(text: string, offset: number): { word: string; start: number; end: number } | undefined {
  const isWordChar = (c: string) => /[A-Za-z0-9_]/.test(c);
  let start = offset;
  while (start > 0 && isWordChar(text[start - 1])) start--;
  let end = offset;
  while (end < text.length && isWordChar(text[end])) end++;
  if (start === end || /^[0-9]/.test(text[start])) return undefined;
  return { word: text.slice(start, end), start, end };
}

/** Human readable kind, e.g. for hovers and completion details. */
export function describeKind(kind: SymbolKindName): string {
  switch (kind) {
    case 'sub': return 'SUB';
    case 'function': return 'FUNCTION';
    case 'type': return 'TYPE';
    case 'field': return 'field';
    case 'const': return 'CONST';
    case 'label': return 'label';
  }
}
