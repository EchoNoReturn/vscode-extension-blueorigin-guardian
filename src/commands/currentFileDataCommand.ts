import * as vscode from 'vscode';
import { listEmpty } from '../utils/detailsWebview';
import { DetailWebviewViewProvider } from '../providers/DetailsWebviewViewProvider';
import { CurrentFileItem } from '../types/currentFileTypes';
import { formatDate } from '../utils/index';
/**
 * 点击子目录命令
 */
export const currentFileDataCommand = (context: vscode.ExtensionContext) => {

  let disposable = vscode.commands.registerCommand('blue.currentFileData', (node: CurrentFileItem) => {
    /**
     * 这里实现你的点击命令逻辑
     * 传送的数据是当前文件
     */
    const newBodyContent = `<div>开源组件名称：${node.label}</div>
      <div>文件路径：${node.fpath}</div>
      <div>匹配：${node.full}</div>
      <div>特征匹配数：${node.hitsMain}</div>
      <div>星际：${node.score}</div>
      <div>版本：${node.version}</div>
      <div>许可证：${node.license}</div>
      <div>发布：${formatDate(node.published_at)}</div>
      <div>主页：<a href=${node.homepageMain}>${node.homepageMain}</a></div>
      <div>下载：<a href=${node.download_link}>${node.download_link}</a></div>
      <div class="center">漏洞列表</div>
      <div class="cveDiv">${listEmpty(node.cve)}</div>`;

    DetailWebviewViewProvider.refreshWebview(newBodyContent);
    vscode.commands.executeCommand('blueOrigin_guardian_details.focus');
  });

  context.subscriptions.push(disposable);
};
