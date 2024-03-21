import * as vscode from 'vscode';
import { CurrentFileTreeDataProvider } from './providers/CurrentFile';

export function activate(context: vscode.ExtensionContext) {

	// TODO 待摘除
	console.log('Congratulations, your extension "vscode-extension-blueorigin-guardian" is now active!');

	let disposable = vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.helloWorld', () => {
		const configs = vscode.workspace.getConfiguration('blueOriginGuardian');
		console.log(configs, configs.get('enable'));
		vscode.window.showInformationMessage('Hello World from vscode-extension-blueorigin-guardian!');
	});

	vscode.window.createTreeView('blueOrigin_guardian_currentFile', {
		treeDataProvider: new CurrentFileTreeDataProvider(),
	})

	context.subscriptions.push(
		disposable,
		vscode.commands.registerCommand('extension.activate', () => {
			vscode.workspace.getConfiguration().get('blueOriginGuardian.enable');
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
