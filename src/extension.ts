import * as vscode from 'vscode';
import { ExplorerTreeDataProvider } from './providers/CurrentFile';
import { log } from 'console';
import { fullItem } from './types/CurrentFileType';

export function activate(context: vscode.ExtensionContext) {
	let disposable2 = vscode.commands.registerCommand('extension.openRepo', (node: fullItem) => {
		// 这里实现你的命令逻辑  
		if (node.author) {
			//打印出详细信息
			console.log('打印出详细信息')
			console.log('click信息', node)
		}
	});

	context.subscriptions.push(disposable2);


	// TODO 待摘除
	let disposable = vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.helloWorld', () => {
		const configs = vscode.workspace.getConfiguration('blueOriginGuardian');
		vscode.window.showInformationMessage('Hello World from vscode-extension-blueorigin-guardian!');
	});

	const currentFileTreeDataProvider = new ExplorerTreeDataProvider();
	vscode.window.createTreeView('blueOrigin_guardian_currentFile', {
		treeDataProvider: currentFileTreeDataProvider,
		showCollapseAll: true,
	})

	const updateCurrentFileView = (editor: vscode.TextEditor | undefined) => {
		if (!editor) return
		currentFileTreeDataProvider.updata(editor)
	}
	updateCurrentFileView(vscode.window.activeTextEditor)
	context.subscriptions.push(
		disposable,
		vscode.window.onDidChangeActiveTextEditor(updateCurrentFileView),

		vscode.commands.registerCommand('extension.activate', () => {
			vscode.workspace.getConfiguration().get('blueOriginGuardian.enable');

		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
