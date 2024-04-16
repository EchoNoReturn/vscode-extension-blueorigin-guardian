import * as vscode from 'vscode';
import { listEmpty } from '../utils/detailsWebview';
import { DetailWebviewViewProvider } from '../providers/DetailsWebviewViewProvider';
import { CompItem, PkgdepItem } from '../types/compviews';
import { compliance } from '../utils/index';

/**
 * 点击子目录命令
 */
export const componentsDataCommand = (context: vscode.ExtensionContext) => {

  let disposable = vscode.commands.registerCommand('blue.componentsData', (node: CompItem & PkgdepItem) => {
    /**
     * 这里实现你的点击命令逻辑
     * 传送的数据是所有组件
     */
    let newBodyContent = ``;
    if (typeof node.license !== 'string') {
      /**
       * 依赖关系组件
       */
      newBodyContent = `<body>  
      <div>依赖关系组件：(Dependency Component)</div>
      <div>组件名称：${node.label}</div>
      <div class="center">组件清单文件</div>
      <div class="filesDiv"> ${listEmpty(node.proj_manifest)}</div>
      <div class="center">组件漏洞</div>
      <div class="cveDiv" > ${listEmpty(node.cve)} </div>
      </body> `;
    } else {
      /**
       * 片段代码组件
       */
      newBodyContent = `<body>  
      <div>片段代码组件：(Snippet Code Component)</div>
      <div>组件名称：${node.label}</div>
      <div>组件合规性：${compliance(node.compliance)}</div>
      <div>官方网址：<a href=""></a></div>
      <div>Star数：${node.score}</div>
      <div>许可证：${node.license}</div>
      <div>来源：${node.source}</div>
      <div class="center">涉及版本</div>
      <div class="filesDiv">${listEmpty(node.versions.split(','))}</div>
      <div class="center">漏洞列表</div>
      <div class="cveDiv"> ${listEmpty(node.cve)}</div>
      <div class="center">影响文件列表</div>
      <div class="filesDiv">${listEmpty(node.proj_files)}</div>
      </body> `;
    }
    /**
     * 刷新webviewhtml
     */
    DetailWebviewViewProvider.refreshWebview(newBodyContent);

  });

  context.subscriptions.push(disposable);
};
