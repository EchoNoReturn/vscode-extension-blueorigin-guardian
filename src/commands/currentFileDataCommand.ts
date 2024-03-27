import * as vscode from 'vscode';
// import { fullItem } from '../types/CurrentFileType';
// import { CompItem } from '../types/compviews';
// import { LicensesItem } from '../types/licenses';
import { listEmpty } from '../utils/detailsWebview';
import { DetailWebviewViewProvider } from '../providers/DetailsWebviewViewProvider'

/**
   * 点击子目录命令
   */
export const currentFileDataCommand = (context: vscode.ExtensionContext) => {

  let disposable = vscode.commands.registerCommand('extension.currentFileData', (node: any) => {
    /**
   * 这里实现你的点击命令逻辑
   */
    let body = ``
    console.log('node', node)
    if (typeof node.artifact === 'string') {
      //传送的数据是当前文件
      console.log('当前文件', node)
      body = `<div>开源组件名称：${node.repos}</div>
      <div>文件路径：${node.fpath}</div>
      <div>匹配：${node.full}</div>
      <div>特征匹配数：${node.hits2}</div>
      <div>星际：${node.score}</div>
      <div>版本：${node.version}</div>
      <div>许可证：${node.license}</div>
      <div>发布：${node.published_at}</div>
      <div>主页：<a href=${node.homepage2}>${node.homepage2}</a></div>
      <div>下载：<a href=${node.download_link}>${node.download_link}</a></div>
      <div class="center">漏洞列表</div>
      <div class="cveDiv">${listEmpty(node.cve)}</div>`
    } else if (typeof node.num === 'string') {
      //传送的数据是所有组件
      console.log('所有组件')
      body = `<body>  
      <div>片段代码组件：(Snippet Code Component)</div>
      <div>组件名称：${node.label}</div>
      <div>组件合规性：${node.compliance}</div>
      <div>官方网址：<a href=${node.compliance}>${node.compliance}</a></div>
      <div>Star数：${node.score}</div>
      <div>许可证：${node.license}</div>
      <div>来源：${node.source}</div>
      <div>涉及版本：${node.versions}</div>
      <div class="center">漏洞列表</div>
      <div class="cveDiv"> ${listEmpty(node.cve)}</div>
      <div class="center">影响文件列表</div>
      <div class="filesDiv">${listEmpty(node.proj_files)}</div>
      </body> `

    } else {
      //传送的数据是所有许可证
      console.log('所有许可证')
      body = `<div>许可证名称：${node.label}</div>
      <div>合规性：${node.compliance}</div>
      <div>参考地址：<a href=${node.full}>${node.full}</a></div>
    `
    }

    /**
  * 最终webview html
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
            // line-height: 100px;
            overflow-y: auto;
           }
           .center{
             text-align: center;
           }
          //  a{
          //   text-decoration: none;
          //  }
        </style>
    </head>  
    ${body}
    </html>`
    /**
    * 刷新webviewhtml
    */
    DetailWebviewViewProvider.refreshWebview(newHtmlContent);

  });

  context.subscriptions.push(disposable);
}
