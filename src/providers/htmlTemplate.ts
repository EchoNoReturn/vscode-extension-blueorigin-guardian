import { CveSeverity } from "../shared";
import { CveInfo, VulData } from "../types/cveviews";
import { MessageType } from "./DetailsWebviewViewProvider";

export const cveInfoTemplate = (data: CveInfo): string => {
  let color = '';
  switch (data.severity) {
    case CveSeverity.HIGH:
      color = 'red';
      break;
    case CveSeverity.MEDIUM:
      color = 'orange';
      break;
    case CveSeverity.LOW:
      color = 'green';
      break;
  }
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
  <h3>漏洞详情</h3>
  <div>漏洞代号： <span>${data.cve}</span></div>
  <div>严重性：<span class="${color}">${data.severity}</span></div>
  <div>漏洞类型： <span>${data.type}</span></div >
  <div class="center">影响文件</div>
  <div>${renderMetchFileList(matchFileList, 'openFile')}</div>
  <h3>修复建议</h3>
  <div style="margin-bottom: 10px;">请参考<a href="http://nvd.nist.gov/vuln/detail/${data.cve}">http://nvd.nist.gov/vuln/detail/${data.cve}</a>进行修复</div>`;
};

/**
 * 为代码漏洞创建html展示模板
 * @param data 模板数据
 * @returns html模板
 */
export const vulDataTemplate = (data: VulData): string => {
  let color = '';
  switch (data.severity) {
    case CveSeverity.HIGH:
      color = 'red';
      break;
    case CveSeverity.MEDIUM:
      color = 'orange';
      break;
    case CveSeverity.LOW:
      color = 'green';
      break;
  }
  const matchFileList = data.codelines.map((line) => {
    const basePath = data.filePath.split('/').slice(1).join('/');
    return `${basePath}:${line[0]},${line[1]}`;
  });
  return `
  <h3>漏洞详情</h3>
  <div>漏洞代号： <span>${data.cve}</span></div>
  <div>严重性：<span class="${color}">${data.severity}</span></div>
  <div>参考链接：<a href="https://nvd.nist.gov/vuln/detail/${data.cve}">https://nvd.nist.gov/vuln/detail/${data.cve}</a></div >
  <h3>影响文件</h3>
  <div>${renderMetchFileList(matchFileList, 'openFile')}</div>
  `;
};

export function renderMetchFileList(data: string[], action?: MessageType['command']) {
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
    }
    return `<div onclick=onclick="(function(){console.log('click!');vscode.postMessage(${JSON.stringify(message)})})()"><a href="#">${filepath}</a></div>`;
  }).join('');
}

