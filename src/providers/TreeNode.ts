import * as vscode from 'vscode';

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
 * 创建所有漏洞的树节点。包含四个固定节点，所有漏洞数据都展示在子节点下。
 */
export function createAllVulnerabilitiesTreeNode() {
  const baseOnTwoTree = createIntrinsicTreeNodes<any>(['代码漏洞', '组件漏洞'], vscode.TreeItemCollapsibleState.Collapsed);
  baseOnTwoTree.forEach((it) => {
    it.children.push(...createIntrinsicTreeNodes(['高危漏洞', '中危漏洞', '低危漏洞', '未定义'], vscode.TreeItemCollapsibleState.Collapsed));
  });
  return new TreeNode<any>('所有漏洞', vscode.TreeItemCollapsibleState.Collapsed, undefined, baseOnTwoTree);
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