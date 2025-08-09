// src/extension.ts

import * as vscode from 'vscode';
import { checkForSecrets, ScanResult } from './secretScanner';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext): void {
  // 1. Keep the manual command for good measure.
  const manualCommand = vscode.commands.registerCommand('sentinel.checkSelection', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return; // No open text editor
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    if (!selectedText) {
      return; // No text selected
    }

    // THIS IS THE LINE YOU ARE MISSING.
    // YOU MUST ACTUALLY CALL YOUR FUNCTION.
    const result: ScanResult = checkForSecrets(selectedText);

    // Now the rest of your code will work.
    if (result.isSecret) {
      const secretNames = result.findings.map(f => f.name).join(', ');
      vscode.window.showWarningMessage(
        `🚨 SENTINEL: LEAK DETECTED! Found: ${secretNames}. Prompt blocked.`
      );
    } else {
      vscode.window.showInformationMessage('✅ Sentinel: BUILD PROCESS IS WORKING. THIS IS THE NEW CODE.');
    }
  });

  // 2. Add the NEW automatic "on save" event listener.
  const onSaveListener = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    // We don't care about the file type for this demo, just the content.
    const entireFileText = document.getText();
    const result: ScanResult = checkForSecrets(entireFileText);

    if (result.isSecret) {
      const secretNames = result.findings.map(f => f.name).join(', ');
      // The message is slightly different to reflect the context.
      const fileName = document.fileName.split(/[\\/]/).pop();
      vscode.window.showWarningMessage(
        `🚨 SENTINEL (on-bruh): Leak detected in ${fileName}! Found: ${secretNames}.`
      );
    }
  });

  context.subscriptions.push(manualCommand, onSaveListener);
}

// This method is called when your extension is deactivated
export function deactivate(): void {}
