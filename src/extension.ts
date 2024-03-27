import * as vscode from 'vscode';
import { viewManager } from './ViewManager';
import { currentFileDataCommand } from './commands/currentFileDataCommand';
import { componentsDataCommand } from './commands/componentsDataCommand';
import { licensesDataCommand } from './commands/licensesDataCommand';

import { DetailWebviewViewProvider } from './providers/DetailsWebviewViewProvider';
// 假设的对象类型  
import { reScan, runScanner } from './commands/scanner';
import { pollingProjectStatus } from './task/pollingTask';

export function activate(context: vscode.ExtensionContext) {
	currentFileDataCommand(context);

	/**
	 * 执行当前文件情况命令
	 */
	currentFileDataCommand(context);
	/**
	 * 执行所有组件情况命令
	 */
	componentsDataCommand(context);
	/**
	 * 执行所有许可证情况命令
	 */
	licensesDataCommand(context);


	viewManager.init();
	/**
	 * 注册详情webview视图
	 */
	vscode.window.registerWebviewViewProvider("blueOrigin_guardian_details",
		new DetailWebviewViewProvider()
	);


	viewManager.init();

	const updateCurrentFileView = (editor: vscode.TextEditor | undefined) => {
		if (!editor) { return; }
		viewManager.updateCurrentFileView(editor);
	};

	updateCurrentFileView(vscode.window.activeTextEditor);
	/**
	 * 切换文件更新当前文件情况
	 */
	vscode.window.onDidChangeActiveTextEditor(document => {
		if (!document) { return; }
		updateCurrentFileView(vscode.window.activeTextEditor);

	});
	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.runScanner', runScanner),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.reScan', reScan),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.startPollingProjectStatus', () => pollingProjectStatus.start()),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.stopPollingProjectStatus', () => pollingProjectStatus.stop())
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// 取消挂载组件时执行的逻辑
}
