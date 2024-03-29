import * as vscode from 'vscode';
import { createAllVulnerabilitiesTreeNode, TreeNode } from './TreeNode';
import reqBlue from '../requests/BlueBaseServer';
import { CveInfo, CveViewResponse, SimpleCveObject, VulData, VulObject } from '../types/cveviews';
import { TreeNodeUnionType } from '../types';
import { getWorkSpaceFolder } from '../commands/scanner';
import { Cve, CveSeverity, CveType } from '../shared';
import { MyTreeDataProvider } from './AbstractProvider';
import { DetailWebviewViewProvider } from './DetailsWebviewViewProvider';
import { cveInfoTemplate, vulDataTemplate } from './htmlTemplate';

export class AllVulnerabilitiesTreeviewDataProvider implements MyTreeDataProvider<TreeNode<any>> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNodeUnionType> = new vscode.EventEmitter<TreeNodeUnionType>();
  readonly onDidChangeTreeData: vscode.Event<TreeNodeUnionType> = this._onDidChangeTreeData.event;

  private _loadingNode = new TreeNode(
    'rootNode',
    vscode.TreeItemCollapsibleState.None,
    [], [new TreeNode("正在加载...", vscode.TreeItemCollapsibleState.None, [], [])]
  );

  /**
   * 根节点
   */
  private rootNode: TreeNode<any> = this._loadingNode;

  private cveInfo: Record<CveSeverity, CveInfo[]> = {
    [CveSeverity.HIGH]: [] as CveInfo[],
    [CveSeverity.MEDIUM]: [] as CveInfo[],
    [CveSeverity.LOW]: [] as CveInfo[],
    [CveSeverity.UNKNOWN]: [] as CveInfo[],
  };
  private codeVulInfo: Record<CveSeverity, VulData[]> = {
    [CveSeverity.HIGH]: [] as VulData[],
    [CveSeverity.MEDIUM]: [] as VulData[],
    [CveSeverity.LOW]: [] as VulData[],
    [CveSeverity.UNKNOWN]: [] as VulData[],
  };

  constructor() {
    vscode.commands.registerCommand('blue.clickAllVulTreeItem', this.handleTreeItemClick, this);
    this.postdataAndUpdateUI().finally(() => { 
      this.refresh();
    });
  }

  /**
   * 重置数据并更新视图
   */
  updateUI(): void {
    // 数据置空
    [this.cveInfo, this.codeVulInfo].forEach(obj => {
      Object.keys(obj).forEach(key => {
        obj[key as CveSeverity] = [];
      });
    });
    this.rootNode = this._loadingNode;
    this.refresh();
    // 更新数据并重绘UI
    this.postdataAndUpdateUI();
  }

  /**
   * 点击TreeNode事件
   * @param element TreeNode<CveInfo | VulData>
   */
  handleTreeItemClick(element: TreeNode<CveInfo | VulData>) {
    console.log('handleTreeItemClick', element);
    let newHtmlContent = '';
    const data = element.payloadData;
    if (data instanceof CveInfo) {
      newHtmlContent = cveInfoTemplate(data);
    } else if (data instanceof VulData) {
      newHtmlContent = vulDataTemplate(data);
    } else {
      return;
    }
    DetailWebviewViewProvider.refreshWebview(newHtmlContent);
  }

  getTreeItem(element: TreeNode<any>): vscode.TreeItem | Thenable<vscode.TreeItem> {
    element.command = {
      title: 'handleTreeItemClick',
      command: 'blue.clickAllVulTreeItem',
      arguments: [element]
    };
    return element;
  }

  getChildren(element?: TreeNode<any> | undefined): vscode.ProviderResult<TreeNode<any>[]> {
    return element ? element.children : this.rootNode.children;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * 获取数据,并刚更新视图
   * @returns {Promise<void>}
   */
  async postdataAndUpdateUI() {
    const workSpaceFolder = getWorkSpaceFolder();
    // 以目前活动的文集作为基准定位项目名称，如果没有则获取所有项目的第一个
    const proj = workSpaceFolder?.name ?? vscode.workspace.workspaceFolders?.[0].name;
    if (!proj) {
      vscode.window.showInformationMessage("蓝源卫士：获取当前项工作空间项目信息错误");
      return;
    }
    // 使用项目名获取项目所有的漏洞视图
    try {
      const res = await reqBlue.postData('/local2/getcveview', { proj });
      if (res.status === 200) {
        this.handleData(res.data);
        this.rootNode = createAllVulnerabilitiesTreeNode(this.cveInfo, this.codeVulInfo);
        this.refresh();
      } else {
        console.error(res.data);
        this.rootNode = new TreeNode(
          'root',
          vscode.TreeItemCollapsibleState.None,
          undefined, [new TreeNode("暂无数据", vscode.TreeItemCollapsibleState.None)]
        );
        this.refresh();
        vscode.window.showInformationMessage("蓝源卫士：获取漏洞数据异常");
      }
    } catch (error) {
      this.rootNode = createAllVulnerabilitiesTreeNode(this.cveInfo, this.codeVulInfo);
      this.refresh();
      vscode.window.showErrorMessage("蓝源卫士：获取漏洞数据异常");
    }
    
  }

  /**
   * 处理相应结果
   */
  handleData(data: CveViewResponse) {
    console.log('data', data);
    Object.keys(data).forEach((key) => {
      const newKey = key as keyof CveViewResponse;
      // 对 vul 数据特殊处理
      if (newKey === 'vul') {
        this.handleVul(data, data[newKey]);
        return;
      }
      this.handleCveInfo(data[newKey], Cve.parseTypeString(key));
    });
  }

  handleVul(originData: CveViewResponse, data: VulObject) {
    Object.keys(data).forEach((filePath) => {
      const vuls = data[filePath];
      Object.keys(vuls).forEach((cveInfos) => {
        const vulData = new VulData(filePath, cveInfos, vuls[cveInfos]);
        const severityStr = originData.vul_snippet_cve[vulData.cve].severity;
        vulData.severity = Cve.parseSeverityString(severityStr);
        this.codeVulInfo[vulData.severity].push(vulData);
      });
    });
  }

  handleCveInfo(data: SimpleCveObject, type: CveType) {
    Object.keys(data).forEach((key) => {
      const severity = data[key].severity ?? 'unknown';
      const cveInfo = new CveInfo(
        key,
        type,
        data[key].proj_files,
        data[key].projs,
        Cve.parseSeverityString(severity)
      );
      this.cveInfo[cveInfo.severity].push(cveInfo);
    });
  }
}
