import * as vscode from "vscode";

export type MessageType = {
  command: "openFile" | "showLineNumber";
  filePath?: string;
  lineNumber?: number;
  columeNumber?: number;
};

export class DetailWebviewViewProvider implements vscode.WebviewViewProvider {
  public static currentView: vscode.WebviewView | undefined;

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    /**
     * 保存当前视图的引用
     */
    DetailWebviewViewProvider.currentView = webviewView;
    /**
     * 配置 webview 选项和初始内容
     */
    webviewView.webview.options = {
      // ... 配置项
      enableScripts: true,
    };
    webviewView.webview.html = this.getInitialHtmlContent();
    webviewView.webview.onDidReceiveMessage(async (message: MessageType) => {
      switch (message.command) {
        case "openFile":
          console.log("openFile");
          if (!message.filePath) {
            return;
          }
          this.openFileToLine(
            message.filePath,
            message.lineNumber ?? 1,
            message.columeNumber ?? 0
          );
          break;
        case "showLineNumber":
          // 处理显示行号请求
          break;
      }
    });
  }

  private openFileToLine(
    path: string,
    lineNumber: number,
    columeNumber: number
  ) {
    const uri = vscode.Uri.file(path);
    vscode.workspace.openTextDocument(uri).then((doc) => {
      vscode.window.showTextDocument(doc, {
        preview: false,
        selection: new vscode.Range(
          lineNumber - 1,
          columeNumber,
          lineNumber - 1,
          columeNumber
        ),
      });
    });
  }

  private openFileToDiff() { }

  private getInitialHtmlContent(): string {
    // 返回初始的 HTML 内容
    return `暂无详情展示`;
  }
  /**
   * 定义一个静态方法来更新 webview 的内容
   */
  public static async refreshWebview(newBodyContent: string) {
    if (DetailWebviewViewProvider.currentView) {
      /**
       * 直接更新 webview 的 HTML
       */
      const newHtmlContent = `<!DOCTYPE html>  
    <html lang="en">  
    <head>  
        <meta charset="UTF-8">  
        <meta name="viewport" content="width=device-width, initial-scale=1.0">  
        <title>view</title> 
        <style>
            /* 这里添加 CSS 代码 */
          .filesDiv,.cveDiv{
            height: 100px;
            overflow-y: auto;
            border:1px solid #fff;
            padding-left:5px;
            margin-top:5px;
          }
          .center{
            text-align: center;
          }
          .green{
            color:green;
          }
          .orange{
            color: orange;
          }
          .red{
            color:red;
          }
          .grey{
            color:grey;
          }
          div{
            padding:2px 0;
          }
        </style>
    </head>  
    ${newBodyContent}
    </html>`;
      DetailWebviewViewProvider.currentView.webview.html = newHtmlContent;
    } else {
      /**
       * 如果当前没有 webview 视图，你可以根据需要处理这种情况，例如显示错误消息
       */
      console.error("No webview view available to refresh.");
    }
  }
}
