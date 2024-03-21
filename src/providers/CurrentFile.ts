import * as vscode from 'vscode';
import reqBlue from '../requests/BlueBaseServer';

export class CurrentFileTreeDataProvider implements vscode.TreeDataProvider<FileTreeNode> {
  constructor() { 
  }
  onDidChangeTreeData?: vscode.Event<void | FileTreeNode | FileTreeNode[] | null | undefined> | undefined;
  getTreeItem(element: FileTreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    reqBlue.postData('', {})
    throw new Error('Method not implemented.');
  }
  getChildren(element?: FileTreeNode | undefined): vscode.ProviderResult<FileTreeNode[]> {
    throw new Error('Method not implemented.');
  }
  getParent?(element: FileTreeNode): vscode.ProviderResult<FileTreeNode> {
    throw new Error('Method not implemented.');
  }
  resolveTreeItem?(item: vscode.TreeItem, element: FileTreeNode, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
    throw new Error('Method not implemented.');
  }
  
}

class FileTreeNode { 
  public name: string;
  private age: number;
  protected age2: number;

  constructor(name: string) {
    this.name = name;
    this.age = 30;
    this.age2 = 30;
  }
}

const aaa = new FileTreeNode('sfdds');




