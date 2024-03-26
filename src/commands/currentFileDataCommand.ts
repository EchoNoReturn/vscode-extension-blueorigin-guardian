import * as vscode from 'vscode';
import { fullItem } from '../types/CurrentFileType';
/**
   * 当前文件情况命令
   */
export const currentFileDataCommand = (context: vscode.ExtensionContext) => {
  let disposable = vscode.commands.registerCommand('extension.currentFileData', (node: fullItem) => {
    // 这里实现你的命令逻辑  
    console.log('node', node)
    // if (node.author) {
    //   //打印出详细信息
    //   console.log('打印出详细信息')
    //   console.log('click信息', node)
    // }
  });

  context.subscriptions.push(disposable);
}
