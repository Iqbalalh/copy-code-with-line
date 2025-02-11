const vscode = require("vscode");

function copyCodeWithLineNumbers(startFromOne = false, isRichText = false, indentSize = null) {
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

  // Get base indentation from the first selected line
  const firstLineText = document.lineAt(startLine).text;
  const baseIndentMatch = firstLineText.match(/^(\s*)/);
  const baseIndent = baseIndentMatch ? baseIndentMatch[1].length : 0;

  let copiedText = "";
  let htmlText = `<pre style="font-family: monospace;">`;

  for (let i = startLine; i <= endLine; i++) {
    let lineText = document.lineAt(i).text;

    // Remove base indentation from each line
    if (lineText.startsWith(" ".repeat(baseIndent))) {
      lineText = lineText.slice(baseIndent);
    }

    // Normalize indentation if specified
    if (indentSize !== null) {
      lineText = lineText.replace(/^\s+/, (match) =>
        " ".repeat((match.length / baseIndent) * indentSize)
      );
    }

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
    { enableScripts: true }
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
    vscode.commands.registerCommand("extension.copyWithActualNumberIndent1", () => {
      copyCodeWithLineNumbers(false, false, 1);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.copyWithActualNumberIndent2", () => {
      copyCodeWithLineNumbers(false, false, 2);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.copyWithActualNumberIndent4", () => {
      copyCodeWithLineNumbers(false, false, 4);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.copyWithStartingOneIndent1", () => {
      copyCodeWithLineNumbers(true, false, 1);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.copyWithStartingOneIndent2", () => {
      copyCodeWithLineNumbers(true, false, 2);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.copyWithStartingOneIndent4", () => {
      copyCodeWithLineNumbers(true, false, 4);
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
