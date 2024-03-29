import * as vscode from 'vscode';
import { CompClass } from "../types/compviews";
import { LicensesResponse } from '../types/licenses';
import { CurrentFileResponse } from '../types/currentFileTypes';
import { CveSeverity } from '../shared';
import { CveInfo, VulData } from '../types/cveviews';
export class TreeNode<T> extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
    public readonly payloadData?: T,
    public readonly children: TreeNode<T>[] = [],
  ) {
    super(label, collapsibleState);
  }
}

/**
 * 根据数据创建固有节点
 * @param names 固有节点名称列表
 * @param collapsibleState 默认闭合状态， 默认None
 */
export function createIntrinsicTreeNodes<T>(names: string[], collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None) {
  return names.map(name => new TreeNode<T>(name, collapsibleState));
}

/**
 * 遍历数据，创建树节点
 */
export function createSeverityTreeBaseNode<T>(info: Record<CveSeverity, T[]>, nameKey: keyof T) {
  return Object.keys(info).map(key => {
    // 区分出不同漏洞严重性的树
    return new TreeNode<T>(`${key} (${info[key as CveSeverity].length})`, vscode.TreeItemCollapsibleState.Collapsed, undefined, info[key as CveSeverity].map(it => {
      // 便利数据完成叶子节点的创建
      return new TreeNode<T>(`${it[nameKey]}`, vscode.TreeItemCollapsibleState.None, it);
    }));
  });
}

/**
 * 创建所有漏洞的树节点。包含四个固定节点，所有漏洞数据都展示在子节点下。
 */
export function createAllVulnerabilitiesTreeNode(cveInfo: Record<CveSeverity, CveInfo[]>, codeVulInfo: Record<CveSeverity, VulData[]>) {
  const countItParams = (data: Record<CveSeverity, any[]>) => {
    return Object.keys(data).reduce((acc, key) => {
      const count = data[key as CveSeverity].length;
      return acc + count;
    }, 0);
  };
  const { TreeItemCollapsibleState: State } = vscode; // 名字太长了，直接用State代替

  const cveInfoTree = new TreeNode<CveInfo>(`组件漏洞 (${countItParams(cveInfo)})`,
    State.Collapsed, undefined, createSeverityTreeBaseNode<CveInfo>(cveInfo, 'cve'));

  const codeVulInfoTree = new TreeNode<VulData>(`代码漏洞 (${countItParams(codeVulInfo)})`,
    State.Collapsed, undefined, createSeverityTreeBaseNode<VulData>(codeVulInfo, 'cve'));

  const rootNode = new TreeNode<CveInfo | VulData>('所有漏洞',
    State.Collapsed, undefined, [codeVulInfoTree, cveInfoTree]);

  return rootNode;
}

/**
 * 所有组件树节点
 * @returns 所有组件的树节点
 */
/**
   * 获取数据
   * @returns {Promise<void>}
   */

export function createAllComponentsTreeNode(comp: CompClass) {
  /**
   * 所有组件目录
   */
  const baseOnTwoTree = [{
    label: `片段代码组件(${comp.fragmentData.length})`, collapsibleState: !comp.fragmentData.length ? 0 : 1, children: [{ label: `合规组件(${comp.complianceData.length})`, collapsibleState: !comp.complianceData.length ? 0 : 1, children: comp.complianceData },
    { label: `不合规组件(${comp.unComplianceData.length})`, collapsibleState: !comp.unComplianceData.length ? 0 : 1, children: comp.unComplianceData },
    {
      label: `未定义组件(${comp.undefinedData.length})`, collapsibleState: !comp.undefinedData.length ? 0 : 1,
      children: comp.undefinedData
    }]
  }, {
    label: `依赖关系组件(${comp.dependencyData.length})`, collapsibleState: !comp.dependencyData.length ? 0 : 1, children: [{ label: `匹配漏洞(${comp.cveData.length})`, collapsibleState: !comp.cveData.length ? 0 : 1, children: comp.cveData },
    {
      label: `匹配无漏洞(${comp.unCveData.length})`,
      collapsibleState: !comp.unCveData.length ? 0 : 1, children: comp.unCveData
    }
    ]
  }];
  return new TreeNode<any>('所有组件', vscode.TreeItemCollapsibleState.Collapsed, undefined, baseOnTwoTree);
}

/**
 * 创建许可证视图的所有树节点
 * @returns 所有许可证的树节点
 */
export function createAllLicensesTreeNode(licenses: LicensesResponse) {
  /**
   * 所有许可证目录
   */
  const baseOnTwoTree = [
    { label: `合规(${licenses.compliantLicenses.length})`, collapsibleState: !licenses.compliantLicenses.length ? 0 : 1, children: licenses.compliantLicenses },
    { label: `不合规(${licenses.unCompliantLicenses.length})`, collapsibleState: !licenses.unCompliantLicenses.length ? 0 : 1, children: licenses.unCompliantLicenses },
    { label: `部分合规(${licenses.partialLicenses.length})`, collapsibleState: !licenses.partialLicenses.length ? 0 : 1, children: licenses.partialLicenses },
    { label: `未定义(${licenses.undefinedLicenses.length})`, collapsibleState: !licenses.undefinedLicenses.length ? 0 : 1, children: licenses.undefinedLicenses },
  ];
  return new TreeNode<any>('所有组件', vscode.TreeItemCollapsibleState.Expanded, undefined, baseOnTwoTree);
}
/**
 * 创建当前文件视图的所有树节点
 * @returns 所有当前的树节点
 */
export function CurrentFileTreeNode(currentFile: CurrentFileResponse) {
  /**
   *当文件内容为ubdefined时，返回暂无数据
   */
  if (!vscode.window.activeTextEditor) {
    return new TreeNode<any>('当前', vscode.TreeItemCollapsibleState.Expanded, undefined, [{ label: '暂无数据', collapsibleState: 0, children: [] }]);
  }

  /**
   * 当前文件目录
   */
  const baseOnTwoTree = [
    { label: `匹配漏洞(${currentFile.cveList.length})`, collapsibleState: !currentFile.cveList.length ? 0 : 1, children: currentFile.cveList },
    { label: `完全匹配开源库(${currentFile.fullList.length})`, collapsibleState: !currentFile.fullList.length ? 0 : 1, children: currentFile.fullList },
    { label: `部分匹配开源库(${currentFile.partialList.length})`, collapsibleState: !currentFile.partialList.length ? 0 : 1, children: currentFile.partialList },
  ];

  return new TreeNode<any>('当前', vscode.TreeItemCollapsibleState.Expanded, undefined, baseOnTwoTree);
}
