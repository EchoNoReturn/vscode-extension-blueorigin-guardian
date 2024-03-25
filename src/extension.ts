import * as vscode from 'vscode';
import reqBlue from './requests/BlueBaseServer';
import { viewManager } from './ViewManager';

export function activate(context: vscode.ExtensionContext) {

	// TODO 待摘除
	console.log('Congratulations, your extension "vscode-extension-blueorigin-guardian" is now active!');

	let disposable = vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.helloWorld', () => {
		const res = reqBlue.postData("/local2/getfiletree");
		console.log(res);
		vscode.window.showInformationMessage('Hello World from vscode-extension-blueorigin-guardian!');
	});

	viewManager.init();

	context.subscriptions.push(
		disposable,
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
