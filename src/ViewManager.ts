import * as vscode from 'vscode';
import { AllVulnerabilitiesTreeviewDataProvider } from './providers/AllVulTreeviewDataProvider';
import { CurrentFileTreeDataProvider } from './providers/CurrentFileDataProvider';
import { ExplorerNode } from './types/CurrentFileType';
import { CreateAllComponentsTreeviewDataProvider } from './providers/ComponentsDataProvider';
import { createAllLicensesTreeviewDataProvider } from './providers/LicensesDataProvider';

export const viewManager = new class {
  /**
   * 当前文件视图数据提供者。单独拿出要做树图更新方法
   */
  private _currentFileTreeDataProvider: CurrentFileTreeDataProvider = new CurrentFileTreeDataProvider();
  public _createAllComponentsTreeviewDataProvider: CreateAllComponentsTreeviewDataProvider = new CreateAllComponentsTreeviewDataProvider();

  /**
   * 所有 TreeView 都在此处注册
   */
  private readonly _allTreeViews: { [id: string]: vscode.TreeDataProvider<vscode.TreeItem> | vscode.TreeDataProvider<ExplorerNode> } = {
    // 格式为 id : DataProvider
    /**
     * 当前文件视图数据提供者
     */
    blueOrigin_guardian_currentFile: this._currentFileTreeDataProvider,
    /**
     * 所有漏洞视图数据提供者
     */
    blueOrigin_guardian_vulnerabilities: new AllVulnerabilitiesTreeviewDataProvider(),
    /**
    * 所有组件视图数据提供者
    */
    blueOrigin_guardian_components: this._createAllComponentsTreeviewDataProvider,
    /**
    * 所有许可证视图数据提供者
    */
    blueOrigin_guardian_licenses: new createAllLicensesTreeviewDataProvider(),

  };

  /**
   * 所有需要创建的 WebView 都在这这里注册
   */
  private readonly _allWebViews: { [id: string]: vscode.WebviewViewProvider } = {
    // 格式为 id : WebviewViewProvider
  };

  /** 更新树图 */
  public updateCurrentFileView = (editor: vscode.TextEditor | undefined) => {
    if (!editor) return
    this._currentFileTreeDataProvider.update(editor)
  };

  /**
   * 初始化视图
   */
  init() {
    Object.keys(this._allTreeViews).forEach(id => {
      vscode.window.createTreeView(id, {
        treeDataProvider: this._allTreeViews[id]
      });

    });
  }

  /**
   * 更新所有视图
   */
  updateAllViews() {
    Object.keys(this._allTreeViews).forEach(id => {
      if (this._allTreeViews[id] instanceof CurrentFileTreeDataProvider) {
        // 更新视图逻辑
      }
    });
  }
};
