import { checkConfig, getWorkSpaceFolder } from "../commands/scanner";
import reqBlue from "../requests/BlueBaseServer";
import * as vscode from "vscode";
import { Project, ProjectStatus } from "../shared";
import { DetailWebviewViewProvider } from "../providers/DetailsWebviewViewProvider";

/**
 * 创建一个轮询任务，该任务在指定的时间间隔内执行指定的任务函数。
 * @param task 任务函数
 * @param interval 时间间隔
 * @returns 带有 start 和 stop 两个方法的对象
 */
export function pollingTask<T>(task: () => T, interval: number) {
  let timer: NodeJS.Timeout | null = null;
  return {
    start() {
      timer = setInterval(task, interval);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
  };
}


export async function checkProjectStatus() {
  // 发起请求查询项目扫描状态
  const currentProject = getWorkSpaceFolder()?.name;
  if (!currentProject) {
    vscode.window.showErrorMessage("蓝源卫士：获取当前打开的项目信息失败");
    return ProjectStatus.UNKNOWN;
  }
  const res = await reqBlue.postData('/local2/checkuserprojects');
  if (res.status === 200) {
    const projectStatusStr = res.data[currentProject] as string | undefined;
    return Project.parseStatusString(projectStatusStr ?? '');
  }
  return ProjectStatus.UNKNOWN;
}

/**
 * 轮询项目状态
 */
export const pollingProjectStatus = pollingTask(async () => {
  if (!checkConfig()) {
    vscode.window.showErrorMessage("蓝源卫士：请完善配置信息！");
    pollingProjectStatus.stop();
  };
  const status = await checkProjectStatus();
  switch (status) {
    case ProjectStatus.FINISHED:
      pollingProjectStatus.stop();
      // 扫描完成，重新加载数据
      vscode.commands.executeCommand('vscode-extension-blueorigin-guardian.refresh');
      DetailWebviewViewProvider.projectStatusWebview(status);
      vscode.window.showInformationMessage("蓝源卫士：项目数据已更新");
      break;
    case ProjectStatus.STARTED:
      // 扫描中
      DetailWebviewViewProvider.postStatusMessage(status);
      console.log("项目扫描中...");
      break;
    case ProjectStatus.PENDING:
      // 队列中
      DetailWebviewViewProvider.postStatusMessage(status);
      console.log("项目排队中...");
      break;
    case ProjectStatus.UNKNOWN:
      console.log("项目状态未知，解除轮询");
      pollingProjectStatus.stop();
      vscode.commands.executeCommand('vscode-extension-blueorigin-guardian.refresh');
      DetailWebviewViewProvider.projectStatusWebview(status);
      vscode.window.showErrorMessage("蓝源卫士：项目状态异常");
      break;
  };
}, 5000);

export const projectStatus = new class {
  private _status: ProjectStatus = ProjectStatus.UNKNOWN;

  constructor() {
    vscode.commands.registerCommand('vscode-extension-blueorigin-guardian.projectStatus', () => {
      vscode.window.showInformationMessage(`蓝源卫士：当前项目状态为：${this._status}`);
      // 重设详情页展示
      DetailWebviewViewProvider.refreshWebview(this._status);
      // 打开webView详情
      vscode.commands.executeCommand('blueOrigin_guardian_details.focus');
    });
  }

  updateStatus(status: ProjectStatus) {
    this._status = status;
  }
};
