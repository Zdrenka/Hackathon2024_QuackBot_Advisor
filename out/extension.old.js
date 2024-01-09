"use strict";
// import * as vscode from "vscode";
// import OpenAI from "openai";
Object.defineProperty(exports, "__esModule", { value: true });
// const openai = new OpenAI({
//   apiKey: "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",
// });
// export function activate(context: vscode.ExtensionContext) {
//   const config = vscode.workspace.getConfiguration("chatView");
//   const prompt = config.get(command) as string;
//   provider.search(prompt);
//   const sessionToken = config.get("sessionToken") as string | undefined;
//   const provider = new ChatGPTViewProvider(context.extensionUri, sessionToken);
//   context.subscriptions.push(
//     vscode.window.registerWebviewViewProvider(
//       ChatGPTViewProvider.viewType,
//       provider,
//       {
//         webviewOptions: { retainContextWhenHidden: true },
//       }
//     )
//   );
// }
// class ChatGPTViewProvider implements vscode.WebviewViewProvider {
//   public static readonly viewType = "chatView";
//   private _view?: vscode.WebviewView;
//   private _openai: any;
//   private _prompt?: string;
//   private _fullPrompt?: string;
//   constructor(
//     private readonly _extensionUri: vscode.Uri,
//     sessionToken: string | undefined
//   ) {}
//   async resolveWebviewView(
//     webviewView: vscode.WebviewView,
//     context: vscode.WebviewViewResolveContext<unknown>,
//     token: vscode.CancellationToken
//   ): Promise<void> {
//     this._view = webviewView;
//     webviewView.webview.options = {
//       enableScripts: true,
//       localResourceRoots: [this._extensionUri],
//     };
//     let chatHistory: { role: string; message: string }[] = [];
//     // Generate a welcome message using the OpenAI API
//     const response = await callGPT(
//       "system",
//       "You are a sarcastic, annoyed, bitter old duck software engineer who knew the user would come crawling back. Keep you're first comment short"
//     );
//     chatHistory.push({ role: "system", message: response ?? "" });
//     // Display the welcome message in the webview
//     webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
//     // Handle messages from the webview
//     webviewView.webview.onDidReceiveMessage(async (message) => {
//       switch (message.command) {
//         case "sendMessage":
//           // Call the OpenAI API with the message text
//           const response = await callGPT("user", message.text);
//           // Update the webview with the response
//           webviewView.webview.html = this._getHtmlForWebview(
//             webviewView.webview
//           );
//           return;
//         case "prompt": {
//           this.search(data.value);
//         }
//       }
//     });
//   }
//   public async search(prompt?: string) {
//     this._prompt = prompt;
//     if (!prompt) {
//       prompt = "";
//     }
//     // focus gpt activity from activity bar
//     if (!this._view) {
//       await vscode.commands.executeCommand("chatgpt.chatView.focus");
//     } else {
//       this._view?.show?.(true);
//     }
//     let response = "";
//     // Get the selected text of the active editor
//     const selection = vscode.window.activeTextEditor?.selection;
//     const selectedText =
//       vscode.window.activeTextEditor?.document.getText(selection);
//     let searchPrompt = "";
//     // if (selection && selectedText) {
//     //   // If there is a selection, add the prompt and the selected text to the search prompt
//     //   if (this.selectedInsideCodeblock) {
//     //     searchPrompt = `${prompt}\n\`\`\`\n${selectedText}\n\`\`\``;
//     //   } else {
//     //     searchPrompt = `${prompt}\n${selectedText}\n`;
//     //   }
//     // } else {
//     // Otherwise, just use the prompt if user typed it
//     searchPrompt = prompt;
//     // }
//     this._fullPrompt = searchPrompt;
//     // If successfully signed in
//     console.log("sendMessage");
//     // Make sure the prompt is shown
//     this._view?.webview.postMessage({
//       type: "setPrompt",
//       value: this._prompt,
//     });
//     if (this._view) {
//       this._view.webview.postMessage({ type: "addResponse", value: "..." });
//     }
//     try {
//       // Send the search prompt to the ChatGPTAPI instance and store the response
//       const response = await callGPT("user", searchPrompt);
//       response = await agent.sendMessage(searchPrompt, {
//         onProgress: (partialResponse) => {
//           if (this._view && this._view.visible) {
//             this._view.webview.postMessage({
//               type: "addResponse",
//               value: partialResponse,
//             });
//           }
//         },
//         timeoutMs: this.timeoutLength * 1000,
//       });
//     } catch (e) {
//       console.error(e);
//       response = `[ERROR] ${e}`;
//     }
//     // Saves the response
//     this._response = response;
//     // Show the view and send a message to the webview with the response
//     if (this._view) {
//       this._view.show?.(true);
//       this._view.webview.postMessage({ type: "addResponse", value: response });
//     }
//   }
//   private _getHtmlForWebview(webview: vscode.Webview) {
//     const scriptUri = webview.asWebviewUri(
//       vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
//     );
//     const microlightUri = webview.asWebviewUri(
//       vscode.Uri.joinPath(
//         this._extensionUri,
//         "media",
//         "scripts",
//         "microlight.min.js"
//       )
//     );
//     const tailwindUri = webview.asWebviewUri(
//       vscode.Uri.joinPath(
//         this._extensionUri,
//         "media",
//         "scripts",
//         "showdown.min.js"
//       )
//     );
//     const showdownUri = webview.asWebviewUri(
//       vscode.Uri.joinPath(
//         this._extensionUri,
//         "media",
//         "scripts",
//         "tailwind.min.js"
//       )
//     );
//     return `<!DOCTYPE html>
// 			<html lang="en">
// 			<head>
// 				<meta charset="UTF-8">
// 				<meta name="viewport" content="width=device-width, initial-scale=1.0">
// 				<script src="${tailwindUri}"></script>
// 				<script src="${showdownUri}"></script>
// 				<script src="${microlightUri}"></script>
// 				<style>
// 				.code {
// 					white-space : pre;
// 				</style>
// 			</head>
// 			<body>
// 				<input class="h-10 w-full text-white bg-stone-700 p-4 text-sm" type="text" id="prompt-input" />
// 				<div id="response" class="pt-6 text-sm">
// 				</div>
// 				<script src="${scriptUri}"></script>
// 			</body>
// 			</html>`;
//   }
// }
// async function callGPT(role: any, content: string): Promise<string> {
//   try {
//     const completion = await openai.chat.completions.create({
//       messages: [
//         {
//           role,
//           content,
//         },
//       ],
//       model: "gpt-4-1106-preview",
//     });
//     const messageContent = completion.choices[0].message.content;
//     return messageContent !== null ? messageContent : "";
//   } catch (e) {
//     console.error("Error calling OpenAI:", e);
//     return `[ERROR] ${e}`;
//   }
// }
// export function deactivate() {}
//# sourceMappingURL=extension.old.js.map