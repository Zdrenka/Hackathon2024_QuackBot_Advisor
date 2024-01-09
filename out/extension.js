"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: "",
});
function activate(context) {
    const config = vscode.workspace.getConfiguration("chatView");
    const provider = new GPTChatViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(GPTChatViewProvider.viewType, provider, {
        webviewOptions: { retainContextWhenHidden: true },
    }));
}
exports.activate = activate;
class GPTChatViewProvider {
    _extensionUri;
    static viewType = "chatView";
    conversationHistory;
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this.conversationHistory = "";
    }
    async resolveWebviewView(webviewView, context, token) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        const initResponse = await this.sendMessageToGPT("system", "You are a sarcastic, annoyed, bitter old programmer who knew the user would come crawling back. Keep you're first comment short");
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
    async sendMessageToGPT(role, content) {
        this.conversationHistory += `\n${role === "user" ? "User" : "AI"}: ${content}`;
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
        }
        catch (e) {
            console.error("Error calling OpenAI:", e);
            return `[ERROR] ${e}`;
        }
    }
    getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.js"));
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
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map