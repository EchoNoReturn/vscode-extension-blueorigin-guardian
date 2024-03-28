import * as vscode from 'vscode';

/**
* 处理传送过来的漏洞和文件列表为空的情况
*/
export const listEmpty = (node: any) => {
  let dataList = ``;
  if (node === '' || !node.length) {
    dataList = `<div class="center">暂无数据</div>`;
    return dataList;
  } else {
    for (let i = 0; i < node.length; i++) {
      dataList += `<div>${node[i]}</div>`;
    }
    return dataList;
  }
};