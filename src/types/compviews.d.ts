/**
 * 所有组件
 */
export interface CompViewResponse {
  /**
   * 片段代码组件
   */
  comp: CompItem[];
  /**
   * 依赖关系组件
   */
  pkgdep: any;
}
/**
 * 所有组件分类
 */
export interface CompClass {
  /**
   * 片段代码合规组件
   */
  complianceData: CompItem[];
  /**
   * 片段代码不合规组件
   */
  unComplianceData: CompItem[];
  /**
   * 片段代码未定义组件
   */
  undefinedData: CompItem[];
  /**
   * 片段代码组件
   */
  fragmentData: CompItem[],
  /**
   * 依赖关系组件
   */
  dependencyData: PkgdepItem[],
  /**
   * 依赖关系匹配漏洞
   */
  cveData: PkgdepItem[],
  /**
   * 依赖关系匹配无漏洞
   */
  unCveData: PkgdepItem[]
}
/**
 * 片段代码组件子组件
 */
export interface CompItem {
  /**
   * 组件合规性
   */
  compliance: string;
  /**
   * 漏洞列表
   */
  cve: any;
  /**
   * 官方网址
   */
  homepage: string;
  key: string;
  /**
   * 许可证
   */
  license: string;
  num: string;
  /**
   * 文件列表
   */
  proj_files: string[];
  project: string;
  projs: string[];
  /**
   * star数
   */
  score: string;
  /**
   * 来源
   */
  source: string;
  /**
   * 组件名称
   */
  label: string;
  /**
   * 涉及版本
   */
  versions: string;
  /**
   * 是否有子目录
   */
  children: [];
  /**
   * 是否展开 0是不展开，1是展开
   */
  collapsibleState: number;
  /**
   * 点击命令
   */
  command: any
}
/**
 * 依赖关系组件子组件
 */
export interface PkgdepItem {
  /**
   * 组件漏洞
   */
  cve: any,
  /**
  * 组件名称
  */
  label: string,
  /**
   * 是否展开 0是不展开，1是展开
   */
  collapsibleState: number,
  /**
   * 是否有子目录
   */
  children: [];
  /**
  * 匹配漏洞
  */
  pkg_vul: string,
  /**
   * 组件清单文件
   */
  proj_manifest: string[],
  provenance: string
}