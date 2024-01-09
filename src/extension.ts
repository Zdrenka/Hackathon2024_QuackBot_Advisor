import * as vscode from "vscode";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "",
});

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("chatView");

  const provider = new GPTChatViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      GPTChatViewProvider.viewType,
      provider,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )
  );
}

class GPTChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "chatView";
  private conversationHistory: string;

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this.conversationHistory = "";
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    const initResponse = await this.sendMessageToGPT(
      "system",
      "You are a sarcastic, annoyed, bitter old programmer who knew the user would come crawling back. Keep you're first comment short"
    );

    webviewView.webview.postMessage({
      command: "appendResponse",
      text: initResponse,
    });

    // Setup message listener from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "sendMessage":
          const gptResponse = await this.sendMessageToGPT("user", message.text);
          webviewView.webview.postMessage({
            command: "appendResponse",
            text: gptResponse,
          });
          break;
      }
    });
  }

  private async sendMessageToGPT(role: any, content: string): Promise<string> {
    this.conversationHistory += `\n${
      role === "user" ? "User" : "AI"
    }: ${content}`;

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: this.conversationHistory,
          },
        ],
        model: "gpt-4-1106-preview",
      });

      const messageContent = completion.choices[0].message.content;
      this.conversationHistory += `\nAI: ${messageContent}`;
      return messageContent !== null ? messageContent : "";
    } catch (e) {
      console.error("Error calling OpenAI:", e);
      return `[ERROR] ${e}`;
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    return `
    <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
            color: #D4D4D4;
        }
        #chat-container {
            flex-grow: 1;
            overflow-y: auto;
            padding: 10px;
            background-color: #1E1E1E;
        }
        #message-container {
            width: 100%;
            display: flex;
        }
        .message {
            margin: 5px;
            padding: 10px;
            border-radius: 10px;
            max-width: 60%;
        }
        .sent {
            margin-left: auto;
            background-color: blue;
        }
        .received {
            background-color: orange;
            color: #1E1E1E;
        }
        #input-container {
            display: flex;
            padding: 10px;
            background-color: #1E1E1E;
            box-shadow: 0 -1px 4px rgba(0,0,0,0.1);
        }
        #input-container input {
            flex-grow: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
        }
    </style>
</head>
<body>
    <div id="chat-container"></div>
    <div id="input-container">
        <input type="text" id="message-input" placeholder="What do you want?!..." />
    </div>

    <script src="${scriptUri}"></script>
</body>
</html>

    `;
  }
}

export function deactivate() {}
