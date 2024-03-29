import * as vscode from 'vscode';
import { DetailWebviewViewProvider } from '../providers/DetailsWebviewViewProvider';
import { LicensesItem } from '../types/licenses';
import { compliance } from '../utils/index';
import license_zh_cn from '../models/license_zh_CN.json';
/**
 * 点击子目录命令
 */
export const licensesDataCommand = (context: vscode.ExtensionContext) => {

  let disposable = vscode.commands.registerCommand('blue.licensesData', (node: LicensesItem) => {
    /**
     * 这里实现你的点击命令逻辑
     * 传送的数据是所有许可证
     */

    /**
     *  从本地json文件重获取到相应的许可证
     */
    const license = license_zh_cn.slice(0);
    const lis = [];
    for (let i = 0; i < license.length; i += 1) {
      if (license[i].name === node.label) {
        lis.push({
          name: license[i].name,
          type: license[i].Severity,
          info: license[i].desc,
          info2: license[i].desc2,
        });
      }
    }

    const newBodyContent = `<div>许可证名称：${node.label}</div>
      <div>合规性：${compliance(node.compliance)}</div>
    <div>参考地址：<a href=${lis[0].info}> ${lis[0].info} </a></div >`;

    /**
     *  创建许可证详情视图
     */
    const webviewPanel = vscode.window.createWebviewPanel(
      'myWebview',//视图类型
      node.label,//视图标题
      vscode.ViewColumn.Seven, // 在哪个列中显示  
      {
        enableScripts: true, // 允许执行脚本  
      }
    );
    webviewPanel.webview.html = lis[0].info2;
    /**
     * 刷新webviewhtml
     */
    DetailWebviewViewProvider.refreshWebview(newBodyContent);

  });

  context.subscriptions.push(disposable);
};
