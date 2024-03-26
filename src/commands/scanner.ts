import * as vscode from "vscode";
import reqBlue from "../requests/BlueBaseServer";
import { zipDir } from "../utils/compressFiles";
import fs from "fs";


export const runScanner = async () => {
  vscode.window.showInformationMessage("蓝源卫士：准备扫描中...");
  // 获取当前文件所在项目路径
  const activeUri = vscode.window.activeTextEditor?.document.uri;
  if (!activeUri) { return; }
  console.log("获取活动文件路径：" + activeUri);
  const workSpaceFolder = vscode.workspace.getWorkspaceFolder(activeUri);
  if (!workSpaceFolder) { return; }
  const projectPath = workSpaceFolder.uri.fsPath;
  console.log('projectPath, 压缩', projectPath);
  // 压缩文件 到 缓存路径
  let zipFilePath = "";
  try {
    zipFilePath = await zipDir(projectPath);
  } catch (error) {
    console.error(error);
    vscode.window.showErrorMessage("蓝源卫士：压缩失败");
  }
  if (!zipFilePath) { return; }
  console.log('zipFilePath， 压缩文件路径', zipFilePath);
  // 上传扫描
  reqBlue.uploadFile(zipFilePath);
};

export const reScan = async () => {
  
};

export const checkConfig = () => {
  const config = vscode.workspace.getConfiguration("blueBase");
};
