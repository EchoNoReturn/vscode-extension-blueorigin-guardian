import * as vscode from 'vscode';
import { CurrentFileTreeNode, TreeNode } from './TreeNode';
import reqBlue from '../requests/BlueBaseServer';
import { CurrentFileResponse } from '../types/currentFileTypes';
import { TreeNodeUnionType } from '../types';
import { getWorkSpaceFolder } from '../commands/scanner';
import { currentFilesItem } from '../utils/index';
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
  private _VUL_SNIPPET_CVE: any[] = [];
  private rootNode: TreeNode<any> = CurrentFileTreeNode(this.currentFileList);
  constructor() {
    /**
     * 初始化文件为空，关闭加载效果
     */
    if (!vscode.window.activeTextEditor) {
      this.currentFileLoading = false;
    }
    /**
     *监听关闭所有文件，重新更新树视图
     */
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
    const scan_result: any = Object.values(
      JSON.parse(dataObj.scan_result),
    );
    //完全匹配开源库
    const fullList: any = [];
    //部分匹配开源库
    const partialList: any = [];
    //漏洞
    const cveList: any = [];
    //完全匹配开源库数据处理
    scan_result[0].full_match.forEach(
      (item: any, index: number) => {
        /**
         * 处理item数据
         */
        currentFilesItem(item, index, 'full(100%)');
        fullList.push(currentFilesItem(item, index, 'full(100%)'));
        //漏洞不为空，添加漏洞
        if (currentFilesItem(item, index, 'full(100%)').cve !== '') {
          cveList.push(currentFilesItem(item, index, 'full(100%)'));
        }
      },
    );
    //部分匹配开源库数据处理
    scan_result[0].snippet_match.forEach(
      (item: any, index: number) => {
        partialList.push(currentFilesItem(item, index, 'partial'));
        //漏洞不为空，添加漏洞
        if (currentFilesItem(item, index, 'partial').cve !== '') {
          cveList.push(currentFilesItem(item, index, 'partial'));
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
    const workSpaceFolder = getWorkSpaceFolder();
    // 以目前活动的文集作为基准定位项目名称，如果没有则获取所有项目的第一个
    const folderName = workSpaceFolder?.name ?? vscode.workspace.workspaceFolders?.[0].name;
    if (!folderName) {
      vscode.window.showInformationMessage("蓝源卫士：获取当前项工作空间项目信息错误");
      return;
    }
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
