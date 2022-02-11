import * as vscode from "vscode";
import { postData, throttledPostData, makeHandleReceiveMessage } from "./post-data";
import { createWebviewPanel } from "./web-view";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("extension.showStepFunction", async () => {
    const { uri, fileName } = vscode.window.activeTextEditor!.document;

    const panel = createWebviewPanel(context);

    postData(panel, uri, fileName);

    vscode.workspace.onDidChangeTextDocument(async (event) => {
      const isActiveDocumentEdit = event.document.uri.fsPath === uri.fsPath;
      const hasSomethingChanged = event.contentChanges.length > 0;

      if (isActiveDocumentEdit && hasSomethingChanged) {
        throttledPostData(panel, uri, fileName);
      }
    }, null);

    panel.webview.onDidReceiveMessage(makeHandleReceiveMessage(uri), null);

    panel.onDidChangeViewState((event) => {
      if (event.webviewPanel.visible) {
        throttledPostData(panel, uri, fileName);
      }
    });
  });

  context.subscriptions.push(disposable);
}
