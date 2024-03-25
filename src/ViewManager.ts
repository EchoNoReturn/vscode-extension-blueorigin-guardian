import * as vscode from 'vscode';
import { AllVulnerabilitiesTreeviewDataProvider } from './providers/AllVulTreeviewDataProvider';
import { CurrentFileTreeDataProvider } from './providers/CurrentFile';

export const viewManager = new class {
  /**
   * 当前文件视图数据提供者。单独拿出要做树图更新方法
   */
  private _currentFileTreeDataProvider: CurrentFileTreeDataProvider = new CurrentFileTreeDataProvider();
  
  /**
   * 所有 TreeView 都在此处注册
   */
  private readonly _allTreeViews: { [id: string]: vscode.TreeDataProvider<vscode.TreeItem>} = {
    // 格式为 id : DataProvider
    /**
     * 当前文件视图数据提供者
     */
    blueOrigin_guardian_currentFile: this._currentFileTreeDataProvider,
    /**
     * 所有漏洞视图数据提供者
     */
    blueOrigin_guardian_vulnerabilities: new AllVulnerabilitiesTreeviewDataProvider()
  };

  /**
   * 所有需要创建的 WebView 都在这这里注册
   */
  private readonly _allWebViews: { [id: string]: vscode.WebviewViewProvider } = {
    // 格式为 id : WebviewViewProvider
  };

  /** 更新树图 */
  public updateCurrentFileView = () => this._currentFileTreeDataProvider.update();

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
};
