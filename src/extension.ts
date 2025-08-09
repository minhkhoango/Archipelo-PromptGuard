import * as vscode from 'vscode';
import { checkForSecrets, ScanResult } from './secretScanner';

let debounceTimer: NodeJS.Timeout;

// A dummy content provider. Its only job is to exist and be registered.
// This is the "license" that lets us listen to the chatSessionInput scheme.
class ChatInputContentProvider implements vscode.TextDocumentContentProvider {
  // We don't need to provide content, but we must implement the interface.
  provideTextDocumentContent(uri: vscode.Uri): string {
    return '';
  }
}

/**
 * The core scanning function. It's debounced to prevent performance issues.
 * @param document The text document to scan.
 */
function scanDocument(document: vscode.TextDocument): void {
  // This is the correct scheme, confirmed by your own investigation.
  // We will only see this log if the event fires AND the scheme matches.
  console.log('[PROMPTGUARD] 5. scanDocument() called with the correct scheme.');

  if (document.uri.scheme !== 'chatSessionInput') {
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const text = document.getText();
    const result: ScanResult = checkForSecrets(text);

    if (result.isSecret) {
      const secretNames = result.findings.map((f) => f.name).join(', ');
      vscode.window.showWarningMessage(
        `🚨 PROMPTGUARD: Potential leak detected! Found: ${secretNames}.`
      );
      console.log('[PROMPTGUARD] 6. Secret found and warning displayed.');
    }
  }, 300);
}

export function activate(context: vscode.ExtensionContext): void {
  // This is a trace. We need to see every step.
  console.log('[PROMPTGUARD] 1. activate() called.');
  try {
    // 1. Perform the handshake: Register our provider for the scheme.
    const provider = new ChatInputContentProvider();
    const providerRegistration = vscode.workspace.registerTextDocumentContentProvider(
      'chatSessionInput',
      provider
    );
    console.log('[PROMPTGUARD] 2. TextDocumentContentProvider registered successfully.');
  } catch (e) {
    console.error('[PROMPTGUARD] 2a. FAILED to register provider:', e);
  }

  // 2. Set up our listener, which will now receive events.
  try {
    const changeListener = vscode.workspace.onDidChangeTextDocument(event => {
      scanDocument(event.document);
    });
    console.log('[PROMPTGUARD] 3. onDidChangeTextDocument listener registered successfully.');
  } catch (e) {
    console.error('[PROMPTGUARD] 3a. FAILED to register listener:', e);
  }
}

export function deactivate(): void {
  clearTimeout(debounceTimer);
}