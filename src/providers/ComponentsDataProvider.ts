import * as vscode from 'vscode';
import { createAllComponentsTreeNode, TreeNode } from './TreeNode';
import reqBlue from '../requests/BlueBaseServer';
import { CompViewResponse, CompItem, CompClass, PkgdepItem } from '../types/compviews';
import { TreeNodeUnionType } from '../types';
import { MyTreeDataProvider } from './AbstractProvider';
export class CreateAllComponentsTreeviewDataProvider implements MyTreeDataProvider<TreeNode<any>> {
  static componentsList(arg0: string, componentsList: any) {
    throw new Error('Method not implemented.');
  }
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNodeUnionType> = new vscode.EventEmitter<TreeNodeUnionType>();
  readonly onDidChangeTreeData: vscode.Event<TreeNodeUnionType> = this._onDidChangeTreeData.event;
  public componentsList: CompClass = {
    complianceData: [],
    unComplianceData: [],
    undefinedData: [],
    fragmentData: [],
    dependencyData: [],
    cveData: [],
    unCveData: []
  };
  public componentsLoading: boolean = true;
  private rootNode: TreeNode<any> = createAllComponentsTreeNode(this.componentsList);
  constructor() {
    this.postdata().finally(() => {
      this.componentsLoading = false;
      this.refresh();
    });
  }
  
  updateUI(): void {
    // TODO 更新数据并重新加载视图
    this.refresh();
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

  refresh(): void {
    this.rootNode = createAllComponentsTreeNode(this.componentsList);
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
    /**
   * 使用项目名获取项目所有的组件视图
   */
    const res = await reqBlue.postData('/local2/getcomponentview', { proj });
    if (res.status === 200) {
      const data = this.handleData(res.data);
      this.componentsList = data;

    } else {
      console.error(res.data);
      vscode.window.showInformationMessage("蓝源卫士：获取所有组件数据异常");
    }
  }

  /**
   * 处理相应结果
   */
  handleData(dataObj: CompViewResponse) {
    // console.log('dataObj', dataObj)
    const fragmentData: CompItem[] = [];
    const complianceData: CompItem[] = [];
    const unComplianceData: CompItem[] = [];
    const undefinedData: CompItem[] = [];
    /**
 * 片段代码组件数据处理
 */
    Object.keys(dataObj.comp).forEach((item: any, index) => {
      const it = dataObj.comp[item];
      it.label = item;
      it.key = item + index;
      it.score = `${dataObj.comp[item].score}`;
      it.num = `${dataObj.comp[item].proj_files.length}`;
      it.versions = `${dataObj.comp[item].versions.toString()}`;
      it.project = dataObj.comp[item].projs.toString();
      it.collapsibleState = 0;
      it.command = {
        command: 'extension.currentFileData', // 使用你注册的命令的标识符  
        title: 'Open Repo', // 命令的标题，显示在 UI 上（可选）  
        arguments: [it] // 传递给命令的参数，这里传递了当前的 ExplorerNode  
      };
      fragmentData.push(it);
      if (it.compliance === "compliant") {
        complianceData.push(it);
      } else if (it.compliance === "undefined") {
        undefinedData.push(it);
      } else {
        unComplianceData.push(it);
      }
    });
    /**
    * 依赖关系组件数据处理
    */
    const dependencyData: PkgdepItem[] = [];
    const cveData: PkgdepItem[] = [];
    const unCveData: PkgdepItem[] = [];
    const proj = 'kernel';
    console.log(Object.keys(dataObj.pkgdep[proj]).forEach((item: any, index) => {
      const it = dataObj.pkgdep[proj][item];
      it.label = item;
      it.key = item + index;
      it.cve = dataObj.pkgdep[proj][item].cve;
      it.pkg_vul = dataObj.pkgdep[proj][item].pkg_vul;
      it.proj_mainfest = dataObj.pkgdep[proj][item].proj_mainfest;
      it.provenance = dataObj.pkgdep[proj][item].provenance;
      it.collapsibleState = 0;
      dependencyData.push(it);
      if (!it.pkg_vul) {
        unCveData.push(it);
      } else {
        cveData.push(it);
      }
    }));

    return { complianceData, unComplianceData, undefinedData, fragmentData, dependencyData, unCveData, cveData };
  }
}
