import * as vscode from 'vscode';
import { createAllVulnerabilitiesTreeNode, TreeNode } from './TreeNode';
import reqBlue from '../requests/BlueBaseServer';
import { CveViewResponse } from '../types/cveviews';
import { TreeNodeUnionType } from '../types';

export class AllVulnerabilitiesTreeviewDataProvider implements vscode.TreeDataProvider<TreeNode<any>> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNodeUnionType> = new vscode.EventEmitter<TreeNodeUnionType>();
  readonly onDidChangeTreeData: vscode.Event<TreeNodeUnionType> = this._onDidChangeTreeData.event;

  private _VUL_SNIPPET_CVE: any[] = [];
  private rootNode: TreeNode<any> = createAllVulnerabilitiesTreeNode();

  constructor() {
    this.postdata().finally(() => { 
      this.refresh();
    });
  }

  getTreeItem(element: TreeNode<any>): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeNode<any> | undefined): vscode.ProviderResult<TreeNode<any>[]> {
    console.log('element',element);
    return element ? element.children : this.rootNode.children;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * 获取数据
   * @returns {Promise<void>}
   */
  async postdata() {
    const activeUri = vscode.window.activeTextEditor?.document.uri;
    if (!activeUri) {
      return;
    }
    const workSpaceFolder = vscode.workspace.getWorkspaceFolder(activeUri);
    if (!workSpaceFolder) {
      return;
    }
    const proj = workSpaceFolder.name;
    // 使用项目名获取项目所有的漏洞视图
    const res = await reqBlue.postData('/local2/getcveview', { proj });
    if (res.status === 200) {
      this.handleData(res.data);
    } else {
      console.error(res.data);
      vscode.window.showInformationMessage("蓝源卫士：获取漏洞数据异常");
    }
  }

  /**
   * 处理相应结果
   */
  handleData(data: CveViewResponse) {
    console.log('data', data);
    // 处理数据
    this.handleAnySnippetCve(data.any_snippet_cve);
    // 获取到新的数据列表，并更新到私有属性

    // 更新视图
  }

  handleAnySnippetCve(data: CveViewResponse['any_snippet_cve']) {
    // 处理数据
  }
  handlePkgDepCve() {
    // 处理依赖关系组件数据
  }
  handleVulSnippetCve() {
    // 处理片段代码漏洞数据
  }
  handleVul() {
    // 处理漏洞数据
  }

  cveGeneralProcessing() {
    // 通用漏洞数据处理方法
  }
}
