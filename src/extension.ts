import * as vscode from 'vscode';
import { viewManager } from './ViewManager';
import { currentFileDataCommand } from './commands/currentFileDataCommand';
import { reScan, runScanner } from './commands/scanner';
import { pollingProjectStatus } from './task/pollingTask';

export function activate(context: vscode.ExtensionContext) {
	currentFileDataCommand(context);

	viewManager.init();

	const updateCurrentFileView = (editor: vscode.TextEditor | undefined) => {
		if (!editor) { return; }
		viewManager.updateCurrentFileView(editor);
	};
	updateCurrentFileView(vscode.window.activeTextEditor);
	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.runScanner', runScanner),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.reScan', reScan),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.startPollingProjectStatus', () => pollingProjectStatus.start()),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.stopPollingProjectStatus', () => pollingProjectStatus.stop()),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.refresh', () => viewManager.updateAllViews())
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// 取消挂载组件时执行的逻辑
}
