import * as vscode from "vscode";
import reqBlue from "../requests/BlueBaseServer";
import { zipDir } from "../utils/compressFiles";

/**
 * 运行扫描
 */
export const runScanner = async () => {
  // 检查配置
  if (!checkConfig()) {
    vscode.window.showErrorMessage("蓝源卫士：请先配置蓝源服务器地址");
    return;
  }
  vscode.window.showInformationMessage("蓝源卫士：准备扫描...");
  const workSpaceFolder = getWorkSpaceFolder();
  if (!workSpaceFolder) {
    vscode.window.showErrorMessage("获取工作空间失败！");
    return;
  }
  const projectPath = workSpaceFolder.uri.fsPath;
  console.log('压缩项目目录', projectPath);
  let zipFilePath = "";
  try {
    zipFilePath = await zipDir(projectPath);
  } catch (error) {
    console.error(error);
    vscode.window.showErrorMessage("蓝源卫士：压缩失败");
  }
  if (!zipFilePath) { return; }
  console.log('压缩文件路径', zipFilePath);
  // 上传扫描
  reqBlue.uploadFile(zipFilePath);
};

/**
 * 重新扫描程序
 * @returns 
 */
export const reScan = async () => {
  // 检查配置
  if (!checkConfig()) {
    vscode.window.showErrorMessage("蓝源卫士：请先配置蓝源服务器地址");
    return;
  };
  const workSpaceFolder = getWorkSpaceFolder();
  const projectName = workSpaceFolder?.name;
  if (!projectName) {
    vscode.window.showErrorMessage("获取项目名称失败！");
    return;
  }
  // 询问重新扫描方式
  const options = ['重新扫描', '重新扫描并覆盖'];
  const chosenOption = await vscode.window.showQuickPick(options, {
    placeHolder: '请选择重新扫描的方式'
  });
  switch (chosenOption) {
    case options[0]:
      reqBlue.postData('/local2/rescanproject', {
        project_name: projectName,
        scope: vscode.workspace.getConfiguration('blueOriginGuardian').get('scope') + ''
      }).then(res => {
        console.log("正在扫描中");
        console.log(res.data);
        vscode.window.showInformationMessage("蓝源卫士：正在扫描中...");
      }).catch(err => {
        console.error(err);
        vscode.window.showErrorMessage("蓝源卫士：重新扫描失败");
      });
      break;
    case options[1]:
      reqBlue.postData('/local2/deletefile', {
        filename: projectName
      }).then(res => {
        if (res.status === 200 && res.data.status === 'success') {
          runScanner();
        } else {
          vscode.window.showErrorMessage("蓝源卫士：项目删除失败");
        }
      }).catch((err) => {
        console.error(err);
        vscode.window.showErrorMessage("蓝源卫士：删除项目失败");
      });
      break;
    default:
      break;
  }
};

/**
 * 检查配置
 * @returns {boolean}
 */
export const checkConfig = () => {
  const config = vscode.workspace.getConfiguration('blueOriginGuardian');
  const baseUrl = config.get('serverAddr');
  const user = config.get('login');
  const pwd = config.get('password');
  return !!baseUrl && !!user && !!pwd;
};

/**
 * 获取工作空间的信息
 * @returns {string | undefined}
 */
export const getWorkSpaceFolder = () => {
  const activeUri = vscode.window.activeTextEditor?.document.uri;
  if (!activeUri) { return; }
  return vscode.workspace.getWorkspaceFolder(activeUri);
};
