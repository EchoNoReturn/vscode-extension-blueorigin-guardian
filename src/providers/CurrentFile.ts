import * as vscode from 'vscode';
import reqBlue from '../requests/BlueBaseServer';
import { TreeNodeUnionType } from '../types';

export class CurrentFileTreeDataProvider implements vscode.TreeDataProvider<FileTreeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNodeUnionType> = new vscode.EventEmitter<TreeNodeUnionType>();
  readonly onDidChangeTreeData: vscode.Event<TreeNodeUnionType> = this._onDidChangeTreeData.event;

  private rootNode: FileTreeNode = new FileTreeNode("root", vscode.TreeItemCollapsibleState.Expanded);

  constructor() {
    this.rootNode.children.push(
      new FileTreeNode("child1", vscode.TreeItemCollapsibleState.Expanded),
      new FileTreeNode("child2", vscode.TreeItemCollapsibleState.Expanded),
      new FileTreeNode("child3", vscode.TreeItemCollapsibleState.Expanded)
    );
  }
  getTreeItem(element: FileTreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(element?: FileTreeNode | undefined): vscode.ProviderResult<FileTreeNode[]> {
    return element ? element.children : this.rootNode.children;
  }
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  update() {
    this.refresh();
  }
}

class FileTreeNode extends vscode.TreeItem {
  constructor(
    public label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public children: FileTreeNode[] = [],
  ) {
    super(label, collapsibleState);
  }
}
