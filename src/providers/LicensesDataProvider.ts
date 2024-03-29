import * as vscode from 'vscode';
import { createAllLicensesTreeNode, TreeNode } from './TreeNode';
import reqBlue from '../requests/BlueBaseServer';
import { LicensesResponse, LicensesItem } from '../types/licenses';
import { TreeNodeUnionType } from '../types';
import { getWorkSpaceFolder } from '../commands/scanner';
export class createAllLicensesTreeviewDataProvider implements vscode.TreeDataProvider<TreeNode<any>> {
  static componentsList(arg0: string, componentsList: any) {
    throw new Error('Method not implemented.');
  }
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNodeUnionType> = new vscode.EventEmitter<TreeNodeUnionType>();
  readonly onDidChangeTreeData: vscode.Event<TreeNodeUnionType> = this._onDidChangeTreeData.event;
  public licensesList: LicensesResponse = {
    licensesData: [],
    compliantLicenses: [],
    unCompliantLicenses: [],
    partialLicenses: [],
    undefinedLicenses: []
  };
  public licensesLoading: boolean = false;
  private _VUL_SNIPPET_CVE: any[] = [];
  private rootNode: TreeNode<any> = createAllLicensesTreeNode(this.licensesList);
  constructor() {
    this.postdata().finally(() => {
      this.licensesLoading = false;
      this.refresh();
    });
  }
  /**
   * 更新
   */
  updateUI(): void {
    // TODO 更新数据并重新加载视图
    // Object.keys(this.licensesList).forEach(key => {
    //   this.licensesList[key as keyof LicensesResponse] = [];
    // });

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
    /**
     * 获取项目名
     */
    const workSpaceFolder = getWorkSpaceFolder();
    // 以目前活动的文集作为基准定位项目名称，如果没有则获取所有项目的第一个
    const proj = workSpaceFolder?.name ?? vscode.workspace.workspaceFolders?.[0].name;
    if (!proj) {
      vscode.window.showInformationMessage("蓝源卫士：获取当前项工作空间项目信息错误");
      return;
    }
    /**
     * 使用项目名获取项目所有的组件视图
     */
    this.licensesLoading = true;
    this.refresh();
    const res = await reqBlue.postData('/local2/getlicenseview', { proj });
    if (res.status === 200) {
      const data = this.handleData(res.data);
      this.licensesList = data;
    } else {
      console.error(res.data);
      vscode.window.showInformationMessage("蓝源卫士：获取所有许可证数据异常");
    }
  }

  /**
   * 处理相应结果
   */
  handleData(dataObj: any) {
    const licensesData: LicensesItem[] = [];
    const compliantLicenses: LicensesItem[] = [];
    const unCompliantLicenses: LicensesItem[] = [];
    const partialLicenses: LicensesItem[] = [];
    const undefinedLicenses: LicensesItem[] = [];
    /**
     * 所有许可证数据处理
     */
    Object.keys(dataObj).forEach((item: any, index) => {
      const it_item = dataObj[item];
      it_item.label = item;
      it_item.key = item + index;
      it_item.compliance = dataObj[item].compliance;
      it_item.collapsibleState = 0;
      licensesData.push(it_item);
      it_item.command = {
        command: 'blue.licensesData', // 使用你注册的命令的标识符  
        title: 'Open Repo', // 命令的标题，显示在 UI 上（可选）  
        arguments: [it_item] // 传递给命令的参数，这里传递了当前的 ExplorerNode  
      };
      if (it_item.compliance === "compliant") {
        compliantLicenses.push(it_item);
      } else if (it_item.compliance === "undefined") {
        undefinedLicenses.push(it_item);
      } else if (it_item.compliance === "partial compliant") {
        partialLicenses.push(it_item);
      }
      else {
        unCompliantLicenses.push(it_item);
      }
    });
    return { licensesData, compliantLicenses, undefinedLicenses, partialLicenses, unCompliantLicenses };
  }
}
