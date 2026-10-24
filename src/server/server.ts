import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  HoverParams,
  Hover,
  MarkupKind,
  InsertTextFormat,
  DocumentSymbol,
  DocumentSymbolParams,
  SymbolKind,
  DefinitionParams,
  Location,
  Range
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { KEYWORDS, FUNCTIONS, DATA_TYPES, ASSEMBLY_INSTRUCTIONS } from './xcbasic3-builtins';
import { parseSymbols, findIncludes, findDefinitions, wordAt, describeKind, SourceSymbol, SymbolKindName } from './symbols';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let workspaceRoots: string[] = [];

connection.onInitialize((params: InitializeParams) => {
  connection.console.log('XC-BASIC3 Language Server starting...');

  workspaceRoots = (params.workspaceFolders ?? [])
    .map(f => toFsPath(f.uri))
    .filter((p): p is string => !!p);
  if (!workspaceRoots.length && params.rootUri) {
    const root = toFsPath(params.rootUri);
    if (root) workspaceRoots = [root];
  }

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['.', ' ']
      },
      hoverProvider: true,
      documentSymbolProvider: true,
      definitionProvider: true
    }
  };

  connection.console.log('XC-BASIC3 Language Server initialized successfully');
  return result;
});

connection.onInitialized(() => {
  connection.console.log('XC-BASIC3 Language Server is ready');
});

// Completion handler with full XC-BASIC3 support
connection.onCompletion(
  (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    connection.console.log('Completion requested');

    const document = documents.get(textDocumentPosition.textDocument.uri);
    if (!document) {
      return [];
    }

    const position = textDocumentPosition.position;
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Get the current line and find what the user is typing
    const lineText = text.split('\n')[position.line];
    const beforeCursor = lineText.substring(0, position.character);

    // Find the current word being typed - handle both "FOR" and "FOR " cases
    let currentWord = '';
    const wordAtCursor = beforeCursor.match(/[a-zA-Z_$][a-zA-Z0-9_$]*$/);
    if (wordAtCursor) {
      currentWord = wordAtCursor[0].toUpperCase();
    } else {
      // Check if there's a word just before a space (like "FOR ")
      const wordBeforeSpace = beforeCursor.match(/[a-zA-Z_$][a-zA-Z0-9_$]*\s*$/);
      if (wordBeforeSpace) {
        const word = wordBeforeSpace[0].trim().toUpperCase();
        if (word) {
          currentWord = word;
        }
      }
    }

    connection.console.log(`Current word: "${currentWord}", Line: "${beforeCursor}"`);

    const completionItems: CompletionItem[] = [];

    // Check if we're in a type context (after "AS ")
    const isTypeContext = /\bAS\s+[a-zA-Z_$]*$/i.test(beforeCursor);

    // User defined symbols of this file and the files it INCLUDEs
    const userSymbols = collectSymbols(textDocumentPosition.textDocument.uri, text);
    for (const { symbol } of userSymbols) {
      if (symbol.line === position.line) continue;
      if (currentWord && !symbol.name.toUpperCase().startsWith(currentWord)) continue;
      if (isTypeContext ? symbol.kind !== 'type' : symbol.kind === 'field') continue;
      completionItems.push({
        label: symbol.name,
        kind: completionKind(symbol.kind),
        detail: `${describeKind(symbol.kind)} ${symbol.name}${symbol.detail ? ' ' + symbol.detail : ''}`,
        sortText: `0${symbol.name}`
      });
    }

    if (isTypeContext) {
      // Only show data types
      DATA_TYPES.forEach(type => {
        if (type.startsWith(currentWord)) {
          completionItems.push({
            label: type,
            kind: CompletionItemKind.TypeParameter,
            detail: `${type} data type`,
            documentation: `XC-BASIC3 ${type} data type`
          });
        }
      });
    } else {
      // Keywords that have dedicated snippets - exclude them from LSP completion to avoid conflicts
      const keywordsWithSnippets = ['FOR', 'IF', 'WHILE', 'SUB', 'FUNCTION', 'SELECT', 'DIM', 'PRINT', 'ASM', 'TYPE'];

      // Add keywords (excluding those with dedicated snippets)
      KEYWORDS.forEach(keyword => {
        if (currentWord === '' || keyword.name.startsWith(currentWord)) {
          // Skip keywords that have dedicated snippets to avoid conflicts
          if (keywordsWithSnippets.includes(keyword.name)) {
            return;
          }

          completionItems.push({
            label: keyword.name,
            kind: CompletionItemKind.Keyword,
            detail: keyword.description,
            documentation: {
              kind: MarkupKind.Markdown,
              value: keyword.syntax ? `**Syntax:** \`${keyword.syntax}\`\n\n${keyword.description}` : keyword.description
            },
            insertText: keyword.name,
            insertTextFormat: InsertTextFormat.PlainText
          });
        }
      });

      // Add functions
      FUNCTIONS.forEach(func => {
        if (currentWord === '' || func.name.startsWith(currentWord)) {
          const paramString = func.parameters.map(p =>
            p.optional ? `[${p.name}]` : p.name
          ).join(', ');

          completionItems.push({
            label: func.name,
            kind: CompletionItemKind.Function,
            detail: `${func.name}(${paramString}) AS ${func.returnType}`,
            documentation: {
              kind: MarkupKind.Markdown,
              value: [
                func.description,
                '',
                '**Parameters:**',
                ...func.parameters.map(p => `- \`${p.name}\` (${p.type}): ${p.description}`),
                '',
                `**Returns:** ${func.returnType}`,
                func.example ? `\n**Example:**\n\`\`\`xcbasic3\n${func.example}\n\`\`\`` : ''
              ].join('\n')
            },
            insertText: `${func.name}(${func.parameters.map((p, i) => `\${${i + 1}:${p.name}}`).join(', ')})`,
            insertTextFormat: InsertTextFormat.Snippet
          });
        }
      });

      // Add data types (when not in type context, still show them for general completion)
      DATA_TYPES.forEach(type => {
        if (currentWord === '' || type.startsWith(currentWord)) {
          completionItems.push({
            label: type,
            kind: CompletionItemKind.TypeParameter,
            detail: `${type} data type`,
            documentation: `XC-BASIC3 ${type} data type`
          });
        }
      });
    }

    connection.console.log(`Returning ${completionItems.length} completion items`);
    return completionItems;
  }
);

// Simple completion resolve handler
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    return item;
  }
);

// Hover handler with full XC-BASIC3 support
connection.onHover(
  (params: HoverParams): Hover | null => {
    connection.console.log('Hover requested');

    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return null;
    }

    const position = params.position;
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Find the word at the current position
    const wordRange = getWordRangeAtPosition(text, offset);
    if (!wordRange) {
      return null;
    }

    const word = text.substring(wordRange.start, wordRange.end).toUpperCase();

    // Check if we're inside an ASM block
    const insideAsmBlock = isInsideAsmBlock(text, offset);

    if (insideAsmBlock) {
      // Look for assembly instructions first when inside ASM block
      const asmInstruction = ASSEMBLY_INSTRUCTIONS.find(i => i.name === word);
      if (asmInstruction) {
        // Build addressing modes table
        const addressingModes = asmInstruction.addressingModes.map(mode =>
          `| ${mode.mode} | \`${mode.assembler}\` | ${mode.opcode} | ${mode.bytes} | ${mode.cycles} |`
        );

        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: [
              `**${asmInstruction.name}** - ${asmInstruction.description}`,
              '',
              `**Operation:** ${asmInstruction.operation}`,
              '',
              '**Status Flags:**',
              '| N | Z | C | I | D | V |',
              '|---|---|---|---|---|---|',
              formatFlags(asmInstruction.flags),
              '',
              '**Addressing Modes:**',
              '| Mode | Assembly | Opcode | Bytes | Cycles |',
              '|------|----------|--------|-------|---------|',
              ...addressingModes
            ].join('\n')
          }
        };
      }
    }

    // Check if it's a keyword
    const keyword = KEYWORDS.find(k => k.name === word);
    if (keyword) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: [
            `**${keyword.name}** (keyword)`,
            '',
            keyword.description,
            keyword.syntax ? `\n**Syntax:** \`${keyword.syntax}\`` : ''
          ].join('\n')
        }
      };
    }

    // Check if it's a function (only if not in ASM block)
    if (!insideAsmBlock) {
      const func = FUNCTIONS.find(f => f.name === word);
      if (func) {
        const paramString = func.parameters.map(p =>
          `${p.name}: ${p.type}${p.optional ? ' (optional)' : ''}`
        ).join(', ');

        return {
          contents: {
            kind: MarkupKind.Markdown,
            value: [
              `**${func.name}**(${paramString}) → ${func.returnType}`,
              '',
              func.description,
              '',
              '**Parameters:**',
              ...func.parameters.map(p => `- \`${p.name}\` (${p.type}): ${p.description}`),
              func.example ? `\n**Example:**\n\`\`\`xcbasic3\n${func.example}\n\`\`\`` : ''
            ].join('\n')
          }
        };
      }
    }

    // Check if it's a data type (only if not in ASM block)
    if (!insideAsmBlock && DATA_TYPES.includes(word)) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: `**${word}** - XC-BASIC3 data type`
        }
      };
    }

    // User defined SUB / FUNCTION / TYPE / CONST / label
    const definitions = findUserDefinitions(params.textDocument.uri, text, word);
    if (definitions.length) {
      const { symbol, fsPath } = definitions[0];
      const sourceLine = (fsPath ? readLines(fsPath) : text.split(/\r?\n/))[symbol.line]?.trim() ?? '';
      const where = fsPath && fsPath !== toFsPath(params.textDocument.uri) ? `\n\n*${path.basename(fsPath)}, line ${symbol.line + 1}*` : '';
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: `**${symbol.name}** (${describeKind(symbol.kind)})\n\n\`\`\`xcbasic3\n${sourceLine}\n\`\`\`${where}`
        }
      };
    }

    return null;
  }
);

// ---------------------------------------------------------------------------
// Outline (document symbols) and Go to Definition

connection.onDocumentSymbol((params: DocumentSymbolParams): DocumentSymbol[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];
  return parseSymbols(document.getText()).map(toDocumentSymbol);
});

connection.onDefinition((params: DefinitionParams): Location[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];
  const text = document.getText();
  const word = wordAt(text, document.offsetAt(params.position));
  if (!word) return [];

  return findUserDefinitions(params.textDocument.uri, text, word.word).map(({ symbol, uri }) =>
    Location.create(uri, Range.create(symbol.line, symbol.startChar, symbol.line, symbol.endChar))
  );
});

interface FoundSymbol {
  symbol: SourceSymbol;
  uri: string;
  /** File system path when known (undefined for untitled / non-file documents). */
  fsPath?: string;
}

function toFsPath(uri: string): string | undefined {
  try {
    return uri.startsWith('file:') ? fileURLToPath(uri) : undefined;
  } catch {
    return undefined;
  }
}

const lineCache = new Map<string, { mtimeMs: number; lines: string[] }>();

function samePath(a: string, b: string): boolean {
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

/** The open editor document for a file, if any (URI encodings differ between VS Code and Node, so compare paths). */
function openDocument(fsPath: string): TextDocument | undefined {
  return documents.all().find(d => {
    const p = toFsPath(d.uri);
    return p !== undefined && samePath(p, fsPath);
  });
}

/** Lines of a file, preferring the open editor's text; disk reads are cached by modification time. */
function readLines(fsPath: string): string[] {
  const open = openDocument(fsPath);
  if (open) return open.getText().split(/\r?\n/);
  try {
    const mtimeMs = fs.statSync(fsPath).mtimeMs;
    const cached = lineCache.get(fsPath);
    if (cached && cached.mtimeMs === mtimeMs) return cached.lines;
    const lines = fs.readFileSync(fsPath, 'utf8').split(/\r?\n/);
    lineCache.set(fsPath, { mtimeMs, lines });
    return lines;
  } catch {
    return [];
  }
}

function textOf(fsPath: string): string | undefined {
  const open = openDocument(fsPath);
  if (open) return open.getText();
  const lines = readLines(fsPath);
  return lines.length ? lines.join('\n') : undefined;
}

/** Symbols of a document plus everything it INCLUDEs (recursively). */
function collectSymbols(uri: string, text: string): FoundSymbol[] {
  const out: FoundSymbol[] = [];
  const visited = new Set<string>();
  const fsPath = toFsPath(uri);
  const visit = (docUri: string, docPath: string | undefined, docText: string, depth: number) => {
    const key = docPath ?? docUri;
    if (visited.has(key) || depth > 12) return;
    visited.add(key);
    for (const symbol of parseSymbols(docText)) out.push({ symbol, uri: docUri, fsPath: docPath });
    if (!docPath) return;
    for (const inc of findIncludes(docText)) {
      const target = path.resolve(path.dirname(docPath), inc.path);
      const incText = textOf(target);
      if (incText !== undefined) visit(pathToFileURL(target).toString(), target, incText, depth + 1);
    }
  };
  visit(uri, fsPath, text, 0);
  return out;
}

/**
 * Definitions of `name` visible from the document: the document itself and its INCLUDEs first,
 * then any other .bas file in the workspace (for symbols defined in the file that includes this one).
 */
function findUserDefinitions(uri: string, text: string, name: string): FoundSymbol[] {
  const pick = (found: FoundSymbol[]): FoundSymbol[] => {
    const hits = findDefinitions(found.map(f => f.symbol), name);
    return found.filter(f => hits.includes(f.symbol));
  };
  const local = pick(collectSymbols(uri, text));
  if (local.length) return local;

  const here = toFsPath(uri);
  const found: FoundSymbol[] = [];
  for (const file of workspaceBasicFiles()) {
    if (file === here) continue;
    const fileText = textOf(file);
    if (fileText === undefined) continue;
    const fileUri = pathToFileURL(file).toString();
    for (const symbol of parseSymbols(fileText)) found.push({ symbol, uri: fileUri, fsPath: file });
  }
  return pick(found);
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'build', 'dist', 'out', '.vscode']);

/** All .bas files under the workspace folders (bounded so a huge folder cannot stall the server). */
function workspaceBasicFiles(): string[] {
  const files: string[] = [];
  const walk = (dir: string, depth: number) => {
    if (depth > 6 || files.length > 500) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.')) walk(full, depth + 1);
      } else if (entry.isFile() && /\.bas$/i.test(entry.name)) {
        files.push(full);
      }
    }
  };
  for (const root of workspaceRoots) walk(root, 0);
  return files;
}

function symbolKind(kind: SymbolKindName): SymbolKind {
  switch (kind) {
    case 'sub': return SymbolKind.Method;
    case 'function': return SymbolKind.Function;
    case 'type': return SymbolKind.Struct;
    case 'field': return SymbolKind.Field;
    case 'const': return SymbolKind.Constant;
    case 'label': return SymbolKind.Key;
  }
}

function completionKind(kind: SymbolKindName): CompletionItemKind {
  switch (kind) {
    case 'sub': return CompletionItemKind.Method;
    case 'function': return CompletionItemKind.Function;
    case 'type': return CompletionItemKind.Struct;
    case 'field': return CompletionItemKind.Field;
    case 'const': return CompletionItemKind.Constant;
    case 'label': return CompletionItemKind.Reference;
  }
}

function toDocumentSymbol(symbol: SourceSymbol): DocumentSymbol {
  const result = DocumentSymbol.create(
    symbol.name,
    symbol.declaration ? `DECLARE ${symbol.detail ?? ''}`.trim() : symbol.detail,
    symbolKind(symbol.kind),
    Range.create(symbol.line, 0, symbol.endLine, symbol.endLineLength),
    Range.create(symbol.line, symbol.startChar, symbol.line, symbol.endChar)
  );
  if (symbol.children?.length) result.children = symbol.children.map(toDocumentSymbol);
  return result;
}

function getWordRangeAtPosition(text: string, offset: number): { start: number; end: number } | null {
  const wordPattern = /[a-zA-Z_$][a-zA-Z0-9_$]*/;

  // Find the start of the word
  let start = offset;
  while (start > 0 && /[a-zA-Z0-9_$]/.test(text[start - 1])) {
    start--;
  }

  // Find the end of the word
  let end = offset;
  while (end < text.length && /[a-zA-Z0-9_$]/.test(text[end])) {
    end++;
  }

  // Check if we found a valid word
  if (start === end || !wordPattern.test(text.substring(start, end))) {
    return null;
  }

  return { start, end };
}

// Function to check if the cursor is inside an ASM block
function isInsideAsmBlock(text: string, offset: number): boolean {
  // Get text up to cursor position
  const textBeforeCursor = text.substring(0, offset);

  // Find all ASM and END ASM occurrences (case insensitive)
  const asmMatches = [...textBeforeCursor.matchAll(/\bASM\b/gi)];
  const endAsmMatches = [...textBeforeCursor.matchAll(/\bEND\s+ASM\b/gi)];

  // Count ASM blocks - we're inside if there are more ASM than END ASM
  return asmMatches.length > endAsmMatches.length;
}

// Function to format flags display for assembly instructions
function formatFlags(flags: any): string {
  const flagNames = ['N', 'Z', 'C', 'I', 'D', 'V'];
  const formattedFlags = flagNames.map(flag => {
    const value = flags[flag];
    if (value === true) {
      return `**${flag}**`;
    } else if (value === false) {
      return `${flag}=0`;
    } else if (typeof value === 'string') {
      return `${flag}=${value}`;
    } else {
      return `-`;
    }
  });

  return `| ${formattedFlags.join(' | ')} |`;
}

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();

connection.console.log('XC-BASIC3 Language Server started');
