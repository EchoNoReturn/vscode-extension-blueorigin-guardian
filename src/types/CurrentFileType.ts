import * as vscode from 'vscode';

/**
 * 目录节点
 */
export interface ExplorerNode extends vscode.TreeItem {
  repos: string;
  children?: ExplorerNode[];
  // 可以添加更多属性，比如id、图标等  
}
export interface Three {
  cveList: fullItem[],
  fullList: fullItem[],
  partialList: fullItem[]
}
export interface fullItem {
  artifact: string,
  author: string,
  cve: string,
  cve_severity: string,
  download_link: string,
  filelicense: string,
  fpath: string,
  full: string,
  hits: string,
  hits2: string,
  homepage: string,
  homepage2: string,
  kbtype: string,
  key: string,
  license: string,
  published_at: string,
  repos: string,
  score: string,
  source: string,
  version: string
}
