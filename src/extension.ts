import * as vscode from 'vscode';
import { SecretScanner } from './secretScanner';

// The ChatResult no longer needs custom metadata for this flow.
// We manage state via commands instead.
interface IRiskLensChatResult extends vscode.ChatResult {}

const ARCHIPELO_RISKLENS_ID = 'archipelo.risklens';

export function activate(context: vscode.ExtensionContext) {
    console.log('[RiskLens] Extension is now active.');
    const scanner = new SecretScanner();

    // The main handler for the @risklens chat participant.
    const handler: vscode.ChatRequestHandler = async (
        request: vscode.ChatRequest,
        chatContext: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<IRiskLensChatResult> => {
        console.log(`[RiskLens] Handler received request. Command: '${request.command || 'none'}'`);

        // --- Path 1: The "/proceed" Command ---
        // This is triggered programmatically by our global command.
        if (request.command === 'proceed') {
            console.log('[RiskLens] /proceed command received. Forwarding to language model.');
            stream.markdown('✅ Risk acknowledged. Forwarding your original prompt to the language model...\n\n---\n\n');
            try {
                const messages = [vscode.LanguageModelChatMessage.User(request.prompt)];
                const chatResponse = await request.model.sendRequest(messages, {}, token);
                for await (const fragment of chatResponse.text) {
                    stream.markdown(fragment);
                }
            } catch (modelError) {
                console.error('[RiskLens] Error during model request forwarding:', modelError);
                stream.markdown('❌ I encountered an error trying to forward your request to the language model. Please try again.');
            }
            return {}; // Success, no further action needed.
        }

        // --- Path 2: Standard Prompt Scanning ---
        const findings = scanner.scanForSecrets(request.prompt);
        console.log(`[RiskLens] Scan complete. Found ${findings.length} potential secret(s).`);

        if (findings.length > 0) {
            // --- Sub-path 2a: Secrets Found (The Warning Flow) ---
            stream.markdown(`🚨 **LEAK DETECTED** 🚨\n\nI found ${findings.length} potential secret(s) in your prompt. Please review and remove them.\n\n`);
            stream.markdown(`> ${request.prompt.replace(/\n/g, '\n> ')}\n\n`);
            stream.markdown(`If you're certain this is not a secret, you can proceed.`);
            
            // It triggers a global command that acts as a simple forwarder.
            stream.button({
                command: 'archipelo.risklens.proceed',
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
                console.error('[RiskLens] Error during model request:', modelError);
                stream.markdown('❌ I encountered an error trying to process your request with the language model. Please try again.');
            }
            return {};
        }
    };

    // Register the chat participant with its handler.
    const risklens = vscode.chat.createChatParticipant(ARCHIPELO_RISKLENS_ID, handler);
    risklens.iconPath = new vscode.ThemeIcon('shield');
    
    // **CRITICAL**: We no longer need the followupProvider. The button is handled directly.
    risklens.followupProvider = undefined;

    // **NEW**: Register the global command that the button will trigger.
    const triggerProceedCommand = vscode.commands.registerCommand('archipelo.risklens.proceed', async (originalPrompt: string) => {
        console.log('[RiskLens] archipelo.risklens.proceed command executed.');
        // This command's ONLY job is to send a new request to the chat view.
        // This new request will be caught by our handler, but this time with the /proceed command.
        await vscode.commands.executeCommand('workbench.action.chat.open', {
            query: `@risklens /proceed ${originalPrompt}`,
            isPartialQuery: false // This is the key: false means it sends immediately.
        });
    });

    context.subscriptions.push(
        risklens,
        triggerProceedCommand
    );
}

export function deactivate() {
    console.log('[RiskLens] Extension deactivated');
}
