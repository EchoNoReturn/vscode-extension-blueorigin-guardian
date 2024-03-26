import * as vscode from 'vscode';
import reqBlue from '../requests/BlueBaseServer';
import { getfileHandle, fuzzyMatch } from '../utils/CurrentFile';
import { ExplorerNode, Three } from '../types/CurrentFileType'


// 实现 TreeDataProvider  
export class CurrentFileTreeDataProvider implements vscode.TreeDataProvider<ExplorerNode> {
  // 初始化数据，这里仅作为示例  
  private _onDidChangeTreeData: vscode.EventEmitter<ExplorerNode | undefined | null | void> = new vscode.EventEmitter<ExplorerNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ExplorerNode | undefined | null | void> = this._onDidChangeTreeData.event;
  public currentFileList: Three | undefined
  private isloading: boolean = false;

  constructor() {
    // 可以在这里加载数据，比如从文件系统、数据库等  
  }

  getTreeItem(element: ExplorerNode): vscode.TreeItem {
    return {
      label: element.repos,
      collapsibleState: element.children ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
      // 可以设置其他TreeItem属性，比如iconPath、contextValue等  
      // 2. 设置命令  
      command: {
        command: 'extension.currentFileData', // 使用你注册的命令的标识符  
        title: 'Open Repo', // 命令的标题，显示在 UI 上（可选）  
        arguments: [element] // 传递给命令的参数，这里传递了当前的 ExplorerNode  
      }
    };
  }

  getChildren(element?: ExplorerNode): Thenable<ExplorerNode[]> {
    if (this.isloading) {
      return Promise.resolve([{ repos: "正在加载..." }])
    }

    if (element) {
      if (fuzzyMatch(element.repos, '漏洞')) {
        return Promise.resolve(!this.currentFileList?.cveList.length ? [{ repos: 'none' }] : this.currentFileList?.cveList);
      } else if (fuzzyMatch(element.repos, '完全')) {
        return Promise.resolve(!this.currentFileList?.fullList.length ? [{ repos: 'none' }] : this.currentFileList?.fullList);
      } else {
        return Promise.resolve(!this.currentFileList?.partialList.length ? [{ repos: 'none' }] : this.currentFileList?.partialList);
      }
    } else {
      if (this.currentFileList) {
        return Promise.resolve([{ repos: `匹配漏洞(${this.currentFileList?.cveList.length})`, children: this.currentFileList?.cveList.length ? [{ repos: '匹配漏洞' }] : undefined },
        { repos: `完全匹配开源库(${this.currentFileList?.fullList.length})`, children: this.currentFileList?.fullList.length ? [{ repos: '完全匹配开源库' }] : undefined },
        { repos: `部分匹配开源库(${this.currentFileList?.partialList.length})`, children: this.currentFileList?.partialList.length ? [{ repos: '部分匹配开源库' }] : undefined }]);
      } else {
        return Promise.resolve([{ repos: '暂无数据' }])
      }
    }

  }
  refresh(): void {
    // 刷新视图，触发onDidChangeTreeData事件  
    this._onDidChangeTreeData.fire();
  }

  update(editor: vscode.TextEditor) {
    this.isloading = true;
    this.refresh()
    // 拿到文件路径
    const activeFileUri = editor.document.uri;
    const activeFilePath = activeFileUri.fsPath;
    //获取文件名
    let folderName = ""
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      // 遍历每个工作区文件夹  
      workspaceFolders.forEach(folder => {
        // 获取文件夹的名字  
        folderName = folder.name;
      });
    }
    const FilePathArr = activeFilePath.split('\\');
    let itemIndex = 0;
    FilePathArr.forEach((item, index) => {
      if (item === folderName) {
        return itemIndex = index
      }
    })
    let now = ""
    for (let i = itemIndex; i < FilePathArr.length; i++) {
      now += FilePathArr[i] + "/"
    }
    console.log('nowwww', now.slice(0, -1))
    // 发起请求
    this.postData().finally(() => {
      this.isloading = false;
      this.refresh();
    })

  }

  async postData() {
    const res = await reqBlue.postData('/local2/getfile', { filename: "kernel/kernel/async.c" })
    const data = getfileHandle(res.data)
    this.currentFileList = data
  }
}
