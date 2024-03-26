import * as vscode from 'vscode';
import { viewManager } from './ViewManager';
import { fullItem } from './types/CurrentFileType';
import { runScanner } from './commands/scanner';

export function activate(context: vscode.ExtensionContext) {
	let disposable2 = vscode.commands.registerCommand('extension.openRepo', (node: fullItem) => {
		// 这里实现你的命令逻辑  
		if (node.author) {
			//打印出详细信息
			console.log('打印出详细信息');
			console.log('click信息', node);
		}
	});

	context.subscriptions.push(disposable2);

	viewManager.init();

	const updateCurrentFileView = (editor: vscode.TextEditor | undefined) => {
		if (!editor) { return; }
		viewManager.updateCurrentFileView(editor);
	};
	updateCurrentFileView(vscode.window.activeTextEditor);
	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.runScanner', runScanner)
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// 取消挂载组件时执行的逻辑
}
