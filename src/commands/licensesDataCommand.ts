import * as vscode from 'vscode';
import { DetailWebviewViewProvider } from '../providers/DetailsWebviewViewProvider';
import { LicensesItem } from '../types/licenses';
import { compliance } from '../utils/index';
/**
 * 点击子目录命令
 */
export const licensesDataCommand = (context: vscode.ExtensionContext) => {

  let disposable = vscode.commands.registerCommand('blue.licensesData', (node: LicensesItem) => {
    /**
     * 这里实现你的点击命令逻辑
     * 传送的数据是所有许可证
     */

    const newBodyContent = `<div>许可证名称：${node.label}</div>
      <div>合规性：${compliance(node.compliance)}</div>
    <div>参考地址：<a href=""></a></div>`;
    /**
     * 刷新webviewhtml
     */
    DetailWebviewViewProvider.refreshWebview(newBodyContent);

  });

  context.subscriptions.push(disposable);
};
