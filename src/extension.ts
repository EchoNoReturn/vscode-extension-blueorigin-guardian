import * as vscode from 'vscode';
import { viewManager } from './ViewManager';
import { currentFileDataCommand } from './commands/currentFileDataCommand';
import { DetailWebviewViewProvider } from './providers/DetailsWebviewViewProvider';
// 假设的对象类型  
import { reScan, runScanner } from './commands/scanner';

export function activate(context: vscode.ExtensionContext) {
	currentFileDataCommand(context);

	viewManager.init();
	/**
				* 注册详情webview视图
				*/
	vscode.window.registerWebviewViewProvider("blueOrigin_guardian_details",
		new DetailWebviewViewProvider()
	);

	const updateCurrentFileView = (editor: vscode.TextEditor | undefined) => {
		if (!editor) { return; }
		viewManager.updateCurrentFileView(editor);
	};
	updateCurrentFileView(vscode.window.activeTextEditor);
	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.runScanner', runScanner),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.reScan', reScan),
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// 取消挂载组件时执行的逻辑
}
