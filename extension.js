const vscode = require("vscode");

function copyCodeWithLineNumbers(startFromOne = false, isRichText = false) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor.");
    return;
  }

  const selection = editor.selection;
  if (selection.isEmpty) {
    vscode.window.showErrorMessage("No text selected.");
    return;
  }

  const document = editor.document;
  const startLine = selection.start.line;
  const endLine = selection.end.line;

  let copiedText = "";
  let htmlText = `<pre style="font-family: monospace;">`;

  for (let i = startLine; i <= endLine; i++) {
    const lineText = document.lineAt(i).text;
    const lineNumber = startFromOne ? i - startLine + 1 : i + 1;
    copiedText += `${lineNumber}. ${lineText}\n`;
    htmlText += `<span>${lineNumber}. ${lineText}</span><br>`;
  }

  htmlText += "</pre>";

  if (isRichText) {
    openWebviewWithHTML(htmlText); // Open a webview to copy rich text
  } else {
    vscode.env.clipboard.writeText(copiedText);
    vscode.window.showInformationMessage("Copied as plain text!");
  }
}

function openWebviewWithHTML(htmlContent) {
  const panel = vscode.window.createWebviewPanel(
    "copyRichText",
    "Copy Code",
    vscode.ViewColumn.One,
    { enableScripts: true } // Enable JS execution
  );

  panel.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Copy Code</title>
    </head>
    <body>
      <div id="content" contenteditable="true" style="font-family: monospace;">${htmlContent}</div>
      <script>
        document.addEventListener("DOMContentLoaded", () => {
          const range = document.createRange();
          range.selectNode(document.getElementById("content"));
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
          document.execCommand("copy"); // Copy rich text
          window.getSelection().removeAllRanges();
          vscode.postMessage({ copied: true });
        });
      </script>
    </body>
    </html>
  `;

  panel.webview.onDidReceiveMessage((message) => {
    if (message.copied) {
      vscode.window.showInformationMessage("Copied as rich text!");
      panel.dispose();
    }
  });
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.copyWithActualNumbersRich",
      () => {
        copyCodeWithLineNumbers(false, true);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.copyWithStartingOneRich", () => {
      copyCodeWithLineNumbers(true, true);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.copyWithActualNumbersPlain",
      () => {
        copyCodeWithLineNumbers(false, false);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.copyWithStartingOnePlain",
      () => {
        copyCodeWithLineNumbers(true, false);
      }
    )
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
