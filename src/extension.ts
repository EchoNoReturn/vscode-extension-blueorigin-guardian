import * as vscode from 'vscode';
import reqBlue from './requests/BlueBaseServer';
import { viewManager } from './ViewManager';
import { currentFileDataCommand } from './commands/currentFileDataCommand';
import { DetailWebviewViewProvider } from './providers/DetailsWebviewViewProvider'
// 假设的对象类型  

export function activate(context: vscode.ExtensionContext) {

	/**
	 * 执行当前文件情况命令
	 */
	currentFileDataCommand(context)
	// TODO 待摘除
	let disposable = vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.helloWorld', () => {
		const res = reqBlue.postData("/local2/getfiletree");
		console.log(res);
		vscode.window.showInformationMessage('Hello World from vscode-extension-blueorigin-guardian!');
	});
	viewManager.init();
	/**
				* 注册详情webview视图
				*/
	vscode.window.registerWebviewViewProvider("blueOrigin_guardian_details",
		new DetailWebviewViewProvider()
	)

	const updateCurrentFileView = (editor: vscode.TextEditor | undefined) => {

		viewManager.updateCurrentFileView(editor)
	}
	updateCurrentFileView(vscode.window.activeTextEditor)
	context.subscriptions.push(
		disposable,
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
