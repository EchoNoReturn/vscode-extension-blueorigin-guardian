import * as vscode from 'vscode';
import { createAllComponentsTreeNode, TreeNode } from './TreeNode';
import reqBlue from '../requests/BlueBaseServer';
import { CompViewResponse, CompItem, CompClass, PkgdepItem } from '../types/compviews';
import { TreeNodeUnionType } from '../types';
import { getWorkSpaceFolder } from '../commands/scanner';
export class CreateAllComponentsTreeviewDataProvider implements vscode.TreeDataProvider<TreeNode<any>> {
  static componentsList(arg0: string, componentsList: any) {
    throw new Error('Method not implemented.');
  }
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNodeUnionType> = new vscode.EventEmitter<TreeNodeUnionType>();
  readonly onDidChangeTreeData: vscode.Event<TreeNodeUnionType> = this._onDidChangeTreeData.event;
  /**
   * 传递给树视图的数据
   */
  public componentsList: CompClass = {
    complianceData: [],
    unComplianceData: [],
    undefinedData: [],
    fragmentData: [],
    dependencyData: [],
    cveData: [],
    unCveData: []
  };

  /**
   * 设置加载效果
   */
  public componentsLoading: boolean = false;
  private _VUL_SNIPPET_CVE: any[] = [];
  private rootNode: TreeNode<any> = createAllComponentsTreeNode(this.componentsList);
  constructor() {
    this.postdata().finally(() => {
      this.componentsLoading = false;
      this.refresh();
    });
  }

  updateUI(): void {
    // Object.keys(this.componentsList).forEach(key => {
    //   this.componentsList[key as keyof CompClass] = [];
    // });

    this.postdata().finally(() => {
      this.componentsLoading = false;
      this.refresh();
    });


  }

  getTreeItem(element: TreeNode<any>): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeNode<any> | undefined): vscode.ProviderResult<TreeNode<any>[]> {
    if (this.componentsLoading) {
      return [{ label: "正在加载...", collapsibleState: 0, children: [] }];
    }
    return element ? element.children : this.rootNode.children;
  }
  /**
   * 视图刷新方法
   */
  refresh(): void {
    this.rootNode = createAllComponentsTreeNode(this.componentsList);
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
    this.componentsLoading = true;
    this.refresh();
    const res = await reqBlue.postData('/local2/getcomponentview', { proj });
    if (res.status === 200) {
      const data = this.handleData(res.data);
      this.componentsList = data;

    } else {
      console.error(res.data);
      vscode.window.showErrorMessage("蓝源卫士：获取所有组件数据异常");
    }


  }

  /**
   * 处理相应结果
   */
  handleData(dataObj: CompViewResponse) {
    const fragmentData: CompItem[] = [];
    const complianceData: CompItem[] = [];
    const unComplianceData: CompItem[] = [];
    const undefinedData: CompItem[] = [];
    /**
     * 片段代码组件数据处理
     */
    Object.keys(dataObj.comp).forEach((item: any, index) => {
      const it_item = dataObj.comp[item];
      it_item.label = item;
      it_item.key = item + index;
      it_item.score = `${dataObj.comp[item].score}`;
      it_item.num = `${dataObj.comp[item].proj_files.length}`;
      it_item.versions = `${dataObj.comp[item].versions.toString()}`;
      it_item.project = dataObj.comp[item].projs.toString();
      it_item.collapsibleState = 0;
      it_item.command = {
        command: 'blue.componentsData', // 使用你注册的命令的标识符  
        title: 'Open Repo', // 命令的标题，显示在 UI 上（可选）  
        arguments: [it_item] // 传递给命令的参数，这里传递了当前的 ExplorerNode  
      };
      fragmentData.push(it_item);
      if (it_item.compliance === "compliant") {
        complianceData.push(it_item);
      } else if (it_item.compliance === "undefined") {
        undefinedData.push(it_item);
      } else {
        unComplianceData.push(it_item);
      }
    });
    /**
     * 依赖关系组件数据处理
     */
    /**
     * 获取项目名
     */
    const workSpaceFolder = getWorkSpaceFolder();
    // 以目前活动的文集作为基准定位项目名称，如果没有则获取所有项目的第一个
    const proj = workSpaceFolder?.name ?? vscode.workspace.workspaceFolders?.[0].name;
    const dependencyData: PkgdepItem[] = [];
    const cveData: PkgdepItem[] = [];
    const unCveData: PkgdepItem[] = [];
    Object.keys(dataObj.pkgdep[proj!]).forEach((item: any, index) => {
      const it_item = dataObj.pkgdep[proj!][item];
      it_item.label = decodeURIComponent(item).split('"')[1];
      it_item.key = item + index;
      it_item.cve = dataObj.pkgdep[proj!][item].cve;
      it_item.pkg_vul = dataObj.pkgdep[proj!][item].pkg_vul;
      it_item.provenance = dataObj.pkgdep[proj!][item].provenance;
      it_item.collapsibleState = 0;
      it_item.command = {
        command: 'blue.componentsData', // 使用你注册的命令的标识符  
        title: 'Open Repo', // 命令的标题，显示在 UI 上（可选）  
        arguments: [it_item] // 传递给命令的参数，这里传递了当前的 ExplorerNode  
      };
      dependencyData.push(it_item);
      if (!it_item.pkg_vul) {
        unCveData.push(it_item);
      } else {
        cveData.push(it_item);
      }
    });

    return { complianceData, unComplianceData, undefinedData, fragmentData, dependencyData, unCveData, cveData };
  }
}
