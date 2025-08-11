import * as vscode from 'vscode';
import { SecretScanner } from './secretScanner';

// The ChatResult no longer needs custom metadata for this flow.
// We manage state via commands instead.
interface ISentinelChatResult extends vscode.ChatResult {}

const SENTINEL_PARTICIPANT_ID = 'sentinel.security';

export function activate(context: vscode.ExtensionContext) {
    console.log('[SENTINEL] Extension is now active.');
    const scanner = new SecretScanner();

    // The main handler for the @sentinel chat participant.
    const handler: vscode.ChatRequestHandler = async (
        request: vscode.ChatRequest,
        chatContext: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<ISentinelChatResult> => {
        console.log(`[SENTINEL] Handler received request. Command: '${request.command || 'none'}'`);

        // --- Path 1: The "/proceed" Command ---
        // This is triggered programmatically by our global command.
        if (request.command === 'proceed') {
            console.log('[SENTINEL] /proceed command received. Forwarding to language model.');
            stream.markdown('✅ Risk acknowledged. Forwarding your original prompt to the language model...\n\n---\n\n');
            try {
                const messages = [vscode.LanguageModelChatMessage.User(request.prompt)];
                const chatResponse = await request.model.sendRequest(messages, {}, token);
                for await (const fragment of chatResponse.text) {
                    stream.markdown(fragment);
                }
            } catch (modelError) {
                console.error('[SENTINEL] Error during model request forwarding:', modelError);
                stream.markdown('❌ I encountered an error trying to forward your request to the language model. Please try again.');
            }
            return {}; // Success, no further action needed.
        }

        // --- Path 2: Standard Prompt Scanning ---
        const findings = scanner.scanForSecrets(request.prompt);
        console.log(`[SENTINEL] Scan complete. Found ${findings.length} potential secret(s).`);

        if (findings.length > 0) {
            // --- Sub-path 2a: Secrets Found (The Warning Flow) ---
            stream.markdown(`🚨 **LEAK DETECTED** 🚨\n\nI found ${findings.length} potential secret(s) in your prompt. Please review and remove them.\n\n`);
            stream.markdown(`> ${request.prompt.replace(/\n/g, '\n> ')}\n\n`);
            stream.markdown(`If you're certain this is not a secret, you can proceed.`);
            
            // It triggers a global command that acts as a simple forwarder.
            stream.button({
                command: 'sentinel.triggerProceed',
                arguments: [request.prompt],
                title: '🔓 Proceed Anyway'
            });

            return {}; // The warning and button have been streamed. The handler's job is done.

        } else {
            // --- Sub-path 2b: No Secrets Found ---
            stream.markdown(`✅ No secrets detected. Processing your request...\n\n---\n\n`);
            try {
                const messages = [vscode.LanguageModelChatMessage.User(request.prompt)];
                const chatResponse = await request.model.sendRequest(messages, {}, token);
                for await (const fragment of chatResponse.text) {
                    stream.markdown(fragment);
                }
            } catch (modelError) {
                console.error('[SENTINEL] Error during model request:', modelError);
                stream.markdown('❌ I encountered an error trying to process your request with the language model. Please try again.');
            }
            return {};
        }
    };

    // Register the chat participant with its handler.
    const sentinel = vscode.chat.createChatParticipant(SENTINEL_PARTICIPANT_ID, handler);
    sentinel.iconPath = new vscode.ThemeIcon('shield');
    
    // **CRITICAL**: We no longer need the followupProvider. The button is handled directly.
    sentinel.followupProvider = undefined;

    // **NEW**: Register the global command that the button will trigger.
    const triggerProceedCommand = vscode.commands.registerCommand('sentinel.triggerProceed', async (originalPrompt: string) => {
        console.log('[SENTINEL] sentinel.triggerProceed command executed.');
        // This command's ONLY job is to send a new request to the chat view.
        // This new request will be caught by our handler, but this time with the /proceed command.
        await vscode.commands.executeCommand('workbench.action.chat.open', {
            query: `@${SENTINEL_PARTICIPANT_ID} /proceed ${originalPrompt}`,
            isPartialQuery: false // This is the key: false means it sends immediately.
        });
    });

    context.subscriptions.push(
        sentinel,
        triggerProceedCommand
    );
}

export function deactivate() {
    console.log('[SENTINEL] Extension deactivated');
}
