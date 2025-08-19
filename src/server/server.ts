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
  InsertTextFormat
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import { KEYWORDS, FUNCTIONS, DATA_TYPES } from './xcbasic3-builtins';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
  connection.console.log('XC-BASIC3 Language Server starting...');

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['.', ' ']
      },
      hoverProvider: true
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

    // Check if it's a function
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

    // Check if it's a data type
    if (DATA_TYPES.includes(word)) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: `**${word}** - XC-BASIC3 data type`
        }
      };
    }

    return null;
  }
);

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

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();

connection.console.log('XC-BASIC3 Language Server started');
