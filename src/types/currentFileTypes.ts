import * as vscode from 'vscode';

/**
 * 目录节点
 */
export interface ExplorerNode extends vscode.TreeItem {
  repos: string;
  children?: ExplorerNode[];
  // 可以添加更多属性，比如id、图标等  
}
/**
 * 当前文件数据分类
 */
export interface CurrentFileResponse {
  cveList: CurrentFileItem[],
  fullList: CurrentFileItem[],
  partialList: CurrentFileItem[]
}
/**
 * 当前文件子目录节点
 */
export interface CurrentFileItem {
  /**
   * artifact/author 开源组件名称
   */
  artifact: string,
  author: string,
  /**
   * 漏洞列表
   */
  cve: string,
  cve_severity: string,
  /**
   * 下载链接
   */
  download_link: string,
  filelicense: string,
  /**
   * 文件路径
   */
  fpath: string,
  /**
   * 匹配
   */
  full: string,
  hits: string,
  /**
   * 特征匹配数
   */
  hitsMain: string,
  homepage: string,
  /**
   * 主页
   */
  homepageMain: string,
  kbtype: string,
  key: string,
  /**
   * 许可证
   */
  license: string,
  /**
   * 发布
   */
  published_at: string,
  repos: string,
  /**
   * 星际
   */
  score: string,
  source: string,
  version: string,
  /**
   *  开源组件名称
   */
  label: string,
  collapsibleState: number,
  children: []
}
