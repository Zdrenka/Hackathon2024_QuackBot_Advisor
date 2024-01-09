// @ts-ignore 

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  window.addEventListener('message', event => {
      const message = event.data; // the message object sent from the extension's backend
      switch (message.command) {
          case 'appendResponse':
              addMessage('received', message.text);
              break;
      }
  });

  document.getElementById('message-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const message = this.value.trim();
        if (message) {
            vscode.postMessage({command: "sendMessage", text: message});
            addMessage('sent', message);
            this.value = '';
        }
    }
});

function addMessage(type, text) {
    const container = document.getElementById('chat-container');
    const messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.textContent = text;
    container.appendChild(messageContainer);
    messageContainer.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight; // Scroll to the bottom
}
})();