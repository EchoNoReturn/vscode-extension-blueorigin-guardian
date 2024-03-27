import * as vscode from 'vscode';
import { createAllLicensesTreeNode, TreeNode } from './TreeNode';
import reqBlue from '../requests/BlueBaseServer';
import { LicensesResponse, LicensesItem } from '../types/licenses';
import { TreeNodeUnionType } from '../types';
import { MyTreeDataProvider } from './AbstractProvider';
export class AllLicensesTreeviewDataProvider implements MyTreeDataProvider<TreeNode<any>> {
  static componentsList(arg0: string, componentsList: any) {
    throw new Error('Method not implemented.');
  }
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNodeUnionType> = new vscode.EventEmitter<TreeNodeUnionType>();
  readonly onDidChangeTreeData: vscode.Event<TreeNodeUnionType> = this._onDidChangeTreeData.event;
  public licensesList: LicensesResponse = {
    licensesData: [],
    compliantLicenses: [],
    unCompliantLicenses: [],
    undefinedLicenses: []
  };
  public licensesLoading: boolean = true;
  private _VUL_SNIPPET_CVE: any[] = [];
  private rootNode: TreeNode<any> = createAllLicensesTreeNode(this.licensesList);
  constructor() {
    this.postdata().finally(() => {
      this.licensesLoading = false;
      this.refresh();
    });
  }

  getTreeItem(element: TreeNode<any>): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeNode<any> | undefined): vscode.ProviderResult<TreeNode<any>[]> {
    if (this.licensesLoading) {
      return [{ label: "正在加载...", collapsibleState: 0, children: [] }];
    }
    return element ? element.children : this.rootNode.children;

  }

  refresh(): void {

    this.rootNode = createAllLicensesTreeNode(this.licensesList);
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

    /**
   * 使用项目名获取项目所有的组件视图
   */
    const proj = 'kernel';
    const res = await reqBlue.postData('/local2/getlicenseview', { proj });
    if (res.status === 200) {
      const data = this.handleData(res.data);
      console.log('data', data);
      this.licensesList = data;

    } else {
      console.error(res.data);
      vscode.window.showInformationMessage("蓝源卫士：获取所有组件数据异常");
    }
  }

  /**
   * 处理相应结果
   */
  handleData(dataObj: any) {
    const licensesData: LicensesItem[] = [];
    const compliantLicenses: LicensesItem[] = [];
    const unCompliantLicenses: LicensesItem[] = [];
    const undefinedLicenses: LicensesItem[] = [];
    /**
 * 所有许可证数据处理
 */
    Object.keys(dataObj).forEach((item: any, index) => {
      const it = dataObj[item];
      it.label = item;
      it.key = item + index;
      it.compliance = dataObj[item].compliance;
      it.collapsibleState = 0;
      licensesData.push(it);
      it.command = {
        command: 'extension.currentFileData', // 使用你注册的命令的标识符  
        title: 'Open Repo', // 命令的标题，显示在 UI 上（可选）  
        arguments: [it] // 传递给命令的参数，这里传递了当前的 ExplorerNode  
      };
      if (it.compliance === "compliant") {
        compliantLicenses.push(it);
      } else if (it.compliance === "undefined") {
        undefinedLicenses.push(it);
      } else {
        unCompliantLicenses.push(it);
      }
    });
    return { licensesData, compliantLicenses, undefinedLicenses, unCompliantLicenses };
  }
}
