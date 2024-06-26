import * as vscode from 'vscode';
import { viewManager } from './ViewManager';
import { currentFileDataCommand } from './commands/currentFileDataCommand';
import { componentsDataCommand } from './commands/componentsDataCommand';
import { licensesDataCommand } from './commands/licensesDataCommand';

// 假设的对象类型  
import { getWorkSpaceFolder, reScan, runScanner } from './commands/scanner';
import { checkProjectStatus, pollingProjectStatus } from './task/pollingTask';
import { DetailWebviewViewProvider } from './providers/DetailsWebviewViewProvider';

export function activate(context: vscode.ExtensionContext) {
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

	// 注册所有的视图
	viewManager.init();

	const updateCurrentFileView = (editor: vscode.TextEditor | undefined) => {
		if (!editor) {
			/**
		 * 刷新webviewhtml
		 */
			DetailWebviewViewProvider.refreshWebview('');
			/**
			 * 刷新数据
			 */
			vscode.commands.executeCommand('vscode-extension-blueorigin-guardian.refresh');
			return;
		}
		viewManager.updateCurrentFileView(editor);
	};
	updateCurrentFileView(vscode.window.activeTextEditor);
	/**
	 * 存储上一个文件夹名
	 */
	let filename: string | undefined = getWorkSpaceFolder()?.name ?? vscode.workspace.workspaceFolders?.[0].name;
	/**
	 * 切换文件更新当前文件情况
	 */
	vscode.window.onDidChangeActiveTextEditor(document => {
		console.log('document', document)
		if (!document) {
			return;
		}
		updateCurrentFileView(vscode.window.activeTextEditor);
		/**
		 * 判断是否切换了文件，切换了则需要更新数据
		 */
		console.log('getWorkSpaceFolder()?.name', getWorkSpaceFolder()?.name)
		console.log('istrue', filename !== getWorkSpaceFolder()?.name ?? vscode.workspace.workspaceFolders?.[0].name)
		if (filename !== getWorkSpaceFolder()?.name ?? vscode.workspace.workspaceFolders?.[0].name) {
			/**
			 * 刷新webviewhtml
			 */
			DetailWebviewViewProvider.refreshWebview('');
			/**
			 * 刷新数据
			 */
			vscode.commands.executeCommand('vscode-extension-blueorigin-guardian.refresh');
		}
		filename = getWorkSpaceFolder()?.name ?? vscode.workspace.workspaceFolders?.[0].name;

	});
	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.runScanner', runScanner),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.reScan', reScan),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.startPollingProjectStatus', () => pollingProjectStatus.start()),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.stopPollingProjectStatus', () => pollingProjectStatus.stop()),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.refresh', () => viewManager.updateAllViews()),
		vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.searchProjectStatus', () => {
			checkProjectStatus().then(status => {
				DetailWebviewViewProvider.projectStatusWebview(status);
			}).catch(error => {
				console.error(error);
				vscode.window.showErrorMessage("蓝源卫士：查询异常");
			});
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// 取消挂载组件时执行的逻辑
}
