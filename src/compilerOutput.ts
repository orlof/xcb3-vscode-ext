// Pure helpers for interpreting xcbasic3 compiler output.
// This module has no VS Code dependency so it can be unit tested with plain Node.

export type Severity = 'error' | 'warning';

export interface CompilerMessage {
  /** File name as printed by the compiler (may be relative). Undefined when the message is not tied to a file. */
  file?: string;
  /** 1-based line, 0 when unknown. */
  line: number;
  /** 0-based column, 0 when unknown. */
  column: number;
  message: string;
  severity: Severity;
}

// err.bas:2.6: syntax error near '"X"' in file err.bas in line 2
// main.bas:10.4: ERROR: Undefined symbol
const LOCATED = /^(.+?):(\d+)\.(\d+):\s*(?:(ERROR|WARNING):\s*)?(.*)$/i;
// ** ERROR ** Failed to open source file - nofile.bas: No such file or directory
const BANNER = /^\*\*\s*(ERROR|WARNING)\s*\*\*\s*(.*)$/i;
// DASM: /tmp/xcbtmp_1234.asm (57): error: Unknown Mnemonic 'foo'.
const DASM = /^(.*?)\s*\((\d+)\):\s*(error|warning):\s*(.*)$/i;
// DASM fatal line
const DASM_FATAL = /^Fatal assembly error:\s*(.*)$/i;

export function parseCompilerOutput(output: string): CompilerMessage[] {
  const messages: CompilerMessage[] = [];
  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    let m = LOCATED.exec(line);
    if (m) {
      messages.push({
        file: m[1].trim(),
        line: parseInt(m[2], 10),
        column: parseInt(m[3], 10),
        message: m[5].trim() || m[4] || 'error',
        severity: (m[4] || '').toLowerCase() === 'warning' ? 'warning' : 'error'
      });
      continue;
    }

    m = BANNER.exec(line);
    if (m) {
      messages.push({
        line: 0,
        column: 0,
        message: m[2].trim(),
        severity: m[1].toLowerCase() === 'warning' ? 'warning' : 'error'
      });
      continue;
    }

    m = DASM.exec(line);
    if (m) {
      messages.push({
        line: 0,
        column: 0,
        message: `DASM: ${m[4].trim()} (generated assembly line ${m[2]})`,
        severity: m[3].toLowerCase() === 'warning' ? 'warning' : 'error'
      });
      continue;
    }

    m = DASM_FATAL.exec(line);
    if (m) {
      messages.push({ line: 0, column: 0, message: `DASM: ${m[1].trim()}`, severity: 'error' });
    }
  }
  return messages;
}

/** Short one-line summary for notifications. */
export function summarize(messages: CompilerMessage[]): string {
  const first = messages.find(m => m.severity === 'error') || messages[0];
  if (!first) return 'Compilation failed';
  const where = first.file ? `${first.file}:${first.line} ` : '';
  return `${where}${first.message}`;
}
