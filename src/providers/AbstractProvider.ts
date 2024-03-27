import * as vscode from 'vscode';

/**
 * TreeDataProvider with refresh method
 */
export interface MyTreeDataProvider<T> extends vscode.TreeDataProvider<T> {
  updateUI(): void;
}