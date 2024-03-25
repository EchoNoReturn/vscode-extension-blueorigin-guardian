import * as vscode from 'vscode';
import reqBlue from './requests/BlueBaseServer';
import { viewManager } from './ViewManager';
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
		const res = reqBlue.postData("/local2/getfiletree");
		console.log(res);
		vscode.window.showInformationMessage('Hello World from vscode-extension-blueorigin-guardian!');
	});

	viewManager.init();

	const updateCurrentFileView = (editor: vscode.TextEditor | undefined) => {
		if (!editor) return
		viewManager.updateCurrentFileView(editor)
	}
	updateCurrentFileView(vscode.window.activeTextEditor)
	context.subscriptions.push(
		disposable,
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
