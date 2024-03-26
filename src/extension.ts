import * as vscode from 'vscode';
import reqBlue from './requests/BlueBaseServer';
import { viewManager } from './ViewManager';
import { currentFileDataCommand } from './commands/currentFileDataCommand'
// 假设的对象类型  
interface MyObject {
	id: number;
	name: string;
}

// 全局状态键  
const MY_OBJECT_KEY = 'myObjectKey';
export function activate(context: vscode.ExtensionContext) {
	// 注册命令  
	context.subscriptions.push(vscode.commands.registerCommand('extension.jumpToTargetView', (object: MyObject) => {
		// 将对象存储到全局状态  
		vscode.workspace.getConfiguration().update(MY_OBJECT_KEY, object, vscode.ConfigurationTarget.Global);

		// 跳转到目标视图（这里假设只是简单地显示目标视图）  
		// viewManager.show();
		// viewManager._createAllComponentsTreeviewDataProvider
	}));
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
