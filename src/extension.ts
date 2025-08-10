import * as vscode from 'vscode';
import { SecretScanner } from './secretScanner';

export function activate(context: vscode.ExtensionContext) {
  const scanner = new SecretScanner();
  // Define the chat request handler
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    _context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    _token: vscode.CancellationToken
  ): Promise<vscode.ChatResult> => {
    const findings = scanner.scanForSecrets(request.prompt);
    
    if (findings.length > 0) {
      let highlightedPrompt = request.prompt;

      // Create a set of unique secret values to handle duplicates
      const uniqueSecretValues = new Set(findings.map(f => f.value));

      uniqueSecretValues.forEach(secretValue => {
        const regex = new RegExp(escapeRegExp(secretValue), 'g');
        highlightedPrompt = highlightedPrompt.replace(regex, `**${secretValue}**`);
      });

      // Contruct the final, visually-rich response
      stream.markdown(`🚨 **LEAK DETECTED** 🚨\n\nFound ${findings.length}
        potential secret(s) in your prompt. I've highlighted them for you below:\n\n`);
      // Use a blockquote to visually separate and display the user's highlighted text
      stream.markdown(`> ${highlightedPrompt.replace(/\n/g, '\n> ')}\n\n`);

      stream.markdown(`⚠️ Please review and remove the highlighted secrets before proceeding.`);
    } else {
      stream.markdown(`✅ No secrets detected. Your prompt is clear.`);
    }

    return { };
  };

  const sentinel = vscode.chat.createChatParticipant('sentinel.security', handler);
  sentinel.iconPath = new vscode.ThemeIcon('shield');
  context.subscriptions.push(sentinel);
}

export function deactivate() {}

// ADD THIS HELPER FUNCTION TO THE BOTTOM OF extension.ts
/**
 * Escapes special characters in a string for use in a regular expression.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}