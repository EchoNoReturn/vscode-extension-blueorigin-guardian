import * as vscode from 'vscode';
import { CurrentFileTreeNode, TreeNode } from './TreeNode';
import reqBlue from '../requests/BlueBaseServer';
import { CurrentFileResponse } from '../types/currentFileTypes';
import { TreeNodeUnionType } from '../types';
import { getWorkSpaceFolder } from '../commands/scanner';
export class CurrentFileTreeDataProvider implements vscode.TreeDataProvider<TreeNode<any>> {
  static componentsList(arg0: string, componentsList: any) {
    throw new Error('Method not implemented.');
  }
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNodeUnionType> = new vscode.EventEmitter<TreeNodeUnionType>();
  readonly onDidChangeTreeData: vscode.Event<TreeNodeUnionType> = this._onDidChangeTreeData.event;
  public currentFileList: CurrentFileResponse = {
    cveList: [],
    fullList: [],
    partialList: []
  };
  public currentFileLoading: boolean = true;
  private rootNode: TreeNode<any> = CurrentFileTreeNode(this.currentFileList);
  constructor() {
    // 初始化文件为空，关闭加载效果
    if (!vscode.window.activeTextEditor) {
      this.currentFileLoading = false;
    }
    // 监听关闭所有文件，重新更新树视图
    vscode.window.onDidChangeActiveTextEditor(document => {
      if (!document) {
        this.rootNode = CurrentFileTreeNode(this.currentFileList);
        this._onDidChangeTreeData.fire();
      }
    });
  }

  updateUI(): void {
    this.refresh();
  }

  getTreeItem(element: TreeNode<any>): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeNode<any> | undefined): vscode.ProviderResult<TreeNode<any>[]> {
    if (this.currentFileLoading) {
      return [{ label: "正在加载...", collapsibleState: 0, children: [] }];
    }
    return element ? element.children : this.rootNode.children;
  }

  refresh(): void {
    this.rootNode = CurrentFileTreeNode(this.currentFileList);
    this._onDidChangeTreeData.fire();
  }

  /**
   * 获取数据
   * @returns {Promise<void>}
   */
  async postdata(filename: string) {
    /**
     * 使用项目名获取项目所有的组件视图
     */
    const res = await reqBlue.postData('/local2/getfile', { filename });
    if (res.status === 200) {
      const data = this.handleData(res.data);
      this.currentFileList = data;
    } else {
      console.error(res.data);
      vscode.window.showInformationMessage("蓝源卫士：获取当前文件数据异常");
    }
  }

  /**
   * 处理相应结果
   */
  handleData(dataObj: { scan_result: any }) {
    const t: any = Object.values(
      JSON.parse(dataObj.scan_result),
    );
    //完全匹配开源库
    const fullList: any = [];
    //部分匹配开源库
    const partialList: any = [];
    //漏洞
    const cveList: any = [];
    //完全匹配开源库数据处理
    t[0].full_match.forEach(
      (item: any, index: number) => {
        const it = item;
        it.label = `${item.author}/${item.artifact}:${item.version}`;
        it.children = [];
        it.collapsibleState = 0;
        it.command = {
          command: 'blue.currentFileData', // 使用你注册的命令的标识符  
          title: 'Open Repo', // 命令的标题，显示在 UI 上（可选）  
          arguments: [it] // 传递给命令的参数，这里传递了当前的 ExplorerNode  
        };
        if (it.homepage === 'null') {
          const abc = it.fpath.split('/');
          const t1 = abc[0].slice(
            0,
            abc[0].lastIndexOf('-'),
          );
          const t2 = t1.slice(
            0,
            t1.lastIndexOf('-'),
          );
          const t3 = t1.slice(
            t1.lastIndexOf('-') + 1,
          );
          it.homepage2 = `https://github.com/${t2}/${t3}`;
        } else {
          it.homepage2 = it.homepage;
        }

        it.repos = `${item.author}/${item.artifact}`;
        it.score = `${item.score}`;
        it.key = item.artifact + index;
        it.full = 'full (100%)';
        it.hits2 = item.hits.slice(
          0,
          item.hits.indexOf(','),
        );
        fullList.push(it);
        //漏洞不为空，添加漏洞
        if (it.cve !== '') {
          cveList.push(it);
        }
      },
    );
    //部分匹配开源库数据处理
    t[0].snippet_match.forEach(
      (item: any, index: number) => {
        const it = item;
        it.label = `${item.author}/${item.artifact}:${item.version}`;
        it.children = [];
        it.collapsibleState = 0;
        it.command = {
          command: 'blue.currentFileData', // 使用你注册的命令的标识符  
          title: 'Open Repo', // 命令的标题，显示在 UI 上（可选）  
          arguments: [it] // 传递给命令的参数，这里传递了当前的 ExplorerNode  
        };
        if (it.homepage === 'null') {
          const abc = it.fpath.split('/');
          const t1 = abc[0].slice(
            0,
            abc[0].lastIndexOf('-'),
          );
          const t2 = t1.slice(
            0,
            t1.lastIndexOf('-'),
          );
          const t3 = t1.slice(
            t1.lastIndexOf('-') + 1,
          );
          it.homepage2 = `https://github.com/${t2}/${t3}`;
        } else {
          it.homepage2 = it.homepage;
        }
        it.repos = `${item.author}/${item.artifact}`;
        it.score = `${item.score}`;
        it.key = item.artifact + index;
        it.full = 'partial';
        it.hits2 = item.hits.slice(
          0,
          item.hits.indexOf(','),
        );
        partialList.push(it);
        //漏洞不为空，添加漏洞
        if (it.cve !== '') {
          cveList.push(it);
        }
      },
    );

    return { fullList, partialList, cveList };
  }
  update(editor: vscode.TextEditor) {
    this.currentFileLoading = true;
    this.refresh();
    /**
     * 获取项目名
     */
    let folderName = getWorkSpaceFolder()?.name;
    /**
     * 获取文件路径
     */
    const activeFileUri = editor.document.uri;
    const activeFilePath = activeFileUri.fsPath;
    const FilePathArr = activeFilePath.split('\\');
    let itemIndex = 0;
    FilePathArr.forEach((item, index) => {
      if (item === folderName) {
        return itemIndex = index;
      }
    });
    let now = folderName + "/";
    for (let i = itemIndex; i < FilePathArr.length; i++) {
      now += FilePathArr[i] + "/";
    }

    const filename = now.slice(0, -1);
    /**
     * 发起请求
     */
    this.postdata(filename).finally(() => {
      this.currentFileLoading = false;
      this.refresh();
    });

  }
}
