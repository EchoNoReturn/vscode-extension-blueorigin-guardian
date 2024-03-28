import * as vscode from "vscode";
import { join } from 'path';
import { getWorkSpaceFolder } from "../commands/scanner";
import reqBlue from "../requests/BlueBaseServer";
import { getLanguage } from "../utils";
export interface VulFixResponse {
  dst_c: string;
  dst_fn: string;
  result: Result[];
  src_c: string;
  src_fn: string;
}
interface Result {
  dst: number[];
  src: number[];
}

export type MessageType = {
  command: "openFile" | "showLineNumber";
  filePath?: string;
  lineNumber?: number;
  columeNumber?: number;
  payloadStr?: string;
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
      if (message.command === "openFile") {
        if (!message.filePath) {
          return;
        }
        console.log('openFile', message.payloadStr);
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const basePath = getWorkSpaceFolder()?.uri.path ?? workspaceFolder?.uri.path;
        if (!basePath) {
          vscode.window.showErrorMessage('未找到工作区');
          return;
        }
        this.openFileToLine(
          join(basePath, message.filePath),
          message.lineNumber ?? 1,
          message.columeNumber ?? 0
        );
        if (message.payloadStr) {
          const payloadData = JSON.parse(message.payloadStr);
          if (payloadData.info && payloadData.codelines && payloadData.filePath) {
            this.openHowToFix({
              matched_commit: (payloadData.info as string).split('__//__').slice(0, -1).join('__//__'),
              region_v: payloadData.codelines,
              fname: payloadData.filePath
            }, [message.lineNumber ?? 1, message.columeNumber ?? 0]);
          }
        }
      };
    });
  }

  /**
   * 打开文件到指定代码位置
   * @param path 文件路径
   * @param lineNumber 定位代码行
   * @param columeNumber 定位代码列
   */
  private async openFileToLine(
    path: string,
    lineNumber: number,
    columeNumber: number
  ) {
    try {
      const doc = await vscode.workspace.openTextDocument(path);
      vscode.window.showTextDocument(doc, {
        preview: false,
        selection: new vscode.Range(
          lineNumber - 1,
          columeNumber,
          lineNumber - 1,
          columeNumber
        ),
      });
    } catch (error) {
      console.log(error);
      vscode.window.showErrorMessage('蓝源卫士：打开文件失败');
    }
  }

  /**
   * 打开修复建议的 Diff 窗口
   * @param data 获取修复建议的必备信息
   * @param currentRange 当前指定的代码片段范围
   */
  private async openHowToFix(data: {
    matched_commit: string,
    region_v: number[][],
    fname: string
  }, currentRange: number[]) {
    vscode.window.showInformationMessage('蓝源卫士：正在为您打开修复建议');
    const res = await reqBlue.postData('/local2/get_vul_fix', data);
    if (res.status === 200) {
      const result = res.data as VulFixResponse;
      const srcDocument = await vscode.workspace.openTextDocument({ content: result.src_c });
      const dstDocument = await vscode.workspace.openTextDocument({ content: result.dst_c });
      vscode.commands.executeCommand('vscode.diff', srcDocument.uri, dstDocument.uri, `${result.dst_fn} - ${result.dst_fn}`, {
        selection: new vscode.Range(currentRange[0] - 1, currentRange[1], currentRange[0] - 1, currentRange[1]),
        language: getLanguage(result.dst_c)
      });
    }
  }

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
          .yellow{
            color:#ffeb3b;
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
      // 如果当前没有 webview 视图，你可以根据需要处理这种情况，例如显示错误消息
      console.error("No webview view available to refresh.");
    }
  }
}
