import { CveSeverity } from "../shared";
import { CveInfo, VulData } from "../types/cveviews";
import { MessageType } from "./DetailsWebviewViewProvider";

/**
 * 打开文件的script方法，用于插入到 html 模板中
 */
export const openFileScript = `
<script>
const vscode = acquireVsCodeApi();
const openfile = (path, lineNumber, columeNumber, payloadStr) => {
  console.log(path, lineNumber, columeNumber);
  vscode.postMessage({
    command: 'openFile',
    filePath: path,
    lineNumber: lineNumber,
    columeNumber: columeNumber,
    payloadStr: payloadStr
  });
}
</script>
`;

export const projectStatusTemplate = `
<div>项目扫描状态：</div>
<div><span id="status"></span></div>
<script>
  const status = document.getElementById('status');
  // 监听来自扩展程序的消息
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
      case 'status':
        status.innerText = message.text;
        break;
    }
  });
</script>`;

export const chooseColor = (s: CveSeverity) => {
  switch (s) {
    case CveSeverity.HIGH:
      return 'red';
    case CveSeverity.MEDIUM:
      return 'orange';
    case CveSeverity.LOW:
      return 'green';
    default:
      return '';
  }
};

export const cveInfoTemplate = (data: CveInfo): string => {
  const color = chooseColor(data.severity);
  const matchFileList = data.proj_files.map(item => {
    if (typeof item === 'object') {
      const plusList: string[] = [];
      new Set((item as any).pkg_manifest as string[]).forEach(it => plusList.push(it));
      for (const it of plusList) {
        return it;
      }
    }
    return item;
  });
  return `
  <h3>组件漏洞</h3>
  <div>漏洞代号： <span>${data.cve}</span></div>
  <div>严重性：<span class="${color}">${data.severity}</span></div>
  <div>漏洞类型： <span>${data.type}</span></div >
  <div class="center">影响文件</div>
  <div>${renderMetchFileList(matchFileList, 'openFile')}</div>
  <h3>修复建议</h3>
  <div style="margin-bottom: 10px;">请参考<a href="http://nvd.nist.gov/vuln/detail/${data.cve}">http://nvd.nist.gov/vuln/detail/${data.cve}</a>进行修复</div>
  ${openFileScript}
  `;
};

/**
 * 为代码漏洞创建html展示模板
 * @param data 模板数据
 * @returns html模板
 */
export const vulDataTemplate = (data: VulData): string => {
  const color = chooseColor(data.severity);
  const matchFileList = data.codelines.map((line) => {
    const basePath = data.filePath.split('/').slice(1).join('/');
    return `${basePath}:${line[0]},${line[1]}`;
  });
  return `
  <h3>代码漏洞</h3>
  <div>漏洞代号： <span>${data.cve}</span></div>
  <div>严重性：<span class="${color}">${data.severity}</span></div>
  <div>参考链接：<a href="https://nvd.nist.gov/vuln/detail/${data.cve}">https://nvd.nist.gov/vuln/detail/${data.cve}</a></div >
  <h3>影响文件</h3>
  <div style="margin-bottom: 10px;">${renderMetchFileList(matchFileList, 'openFile', JSON.stringify(data))}</div>
  ${openFileScript}
  `;
};

export function renderMetchFileList(data: string[], action?: MessageType['command'], payload?: string) {
  if (!data.length) {
    return `
    <div class="center">暂无数据</div>
    `;
  }
  return data.map(item => {
    const filepath = item.split('/').slice(1).join('/');
    if (!action) {
      return `<div><a href="#">${filepath}</a></div>`;
    }
    const message: MessageType = {
      command: action,
      filePath: filepath
    };
    const filepathArr = filepath.split(':');
    if (filepathArr.length > 1) {
      message.filePath = filepathArr[0];
      message.lineNumber = +filepathArr[1].split(',')[0];
      message.columeNumber = +filepathArr[1].split(',')[1];
      payload && (message.payloadStr = payload);
    }
    return `
    <script>const payload = ${JSON.stringify(payload)};</script>
    <div style="cursor: pointer;" onclick="openfile('${message.filePath}',${message.lineNumber ?? 1},${message.columeNumber ?? 0},payload)"><a>${filepath}</a></div>`;
  }).join('');
}

