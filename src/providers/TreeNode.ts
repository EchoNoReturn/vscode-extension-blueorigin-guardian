import * as vscode from 'vscode';
import { CveSeverity } from '../shared';
import { CveInfo, VulData } from '../types/cveviews';

export class TreeNode<T> extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
    public readonly payloadData?: T,
    public readonly children: TreeNode<T>[] = []
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
  const cveInfoTree = new TreeNode<CveInfo>(`组件漏洞 (${countItParams(cveInfo)})`, vscode.TreeItemCollapsibleState.Collapsed, undefined, createSeverityTreeBaseNode<CveInfo>(cveInfo, 'cve'));
  const codeVulInfoTree = new TreeNode<VulData>(`代码漏洞 (${countItParams(codeVulInfo)})`, vscode.TreeItemCollapsibleState.Collapsed, undefined, createSeverityTreeBaseNode<VulData>(codeVulInfo, 'cve'));
  return new TreeNode<CveInfo | VulData>('所有漏洞', vscode.TreeItemCollapsibleState.Collapsed, undefined, [codeVulInfoTree, cveInfoTree]);
}

/**
 * 所有组件树节点
 * @returns 所有组件的树节点
 */
export function createAllComponentsTreeNode(){
  return new TreeNode<any>('所有组件', vscode.TreeItemCollapsibleState.Collapsed, undefined, createIntrinsicTreeNodes(['高危组件', '中危组件', '低危组件', '未定义'], vscode.TreeItemCollapsibleState.Collapsed));
}

/**
 * 创建许可证视图的所有树节点
 * @returns 所有许可证的树节点
 */
export function createAllLicensesTreeNode() {
  return new TreeNode<any>('所有许可证', vscode.TreeItemCollapsibleState.Collapsed, undefined, createIntrinsicTreeNodes(['合规', '部分合规', '不合规', '未定义'], vscode.TreeItemCollapsibleState.Collapsed));
}