export interface CompViewResponse {
  /**
   * 所有组件
   */
  comp: CompItem[];
  pkgdep: any;
}
/**
  * 所有组件分类
  */
export interface CompClass {
  complianceData: CompItem[];
  unComplianceData: CompItem[];
  undefinedData: CompItem[];
  fragmentData: CompItem[],
  dependencyData: PkgdepItem[],
  cveData: PkgdepItem[],
  unCveData: PkgdepItem[]
}
/**
  * 片段代码组件子组件
  */
export interface CompItem {
  compliance: string;
  cve: any;
  homepage: string;
  key: string;
  license: string;
  num: string;
  proj_files: string[];
  project: string;
  projs: string[];
  score: string;
  source: string;
  label: string;
  versions: string;
  children: [];
  collapsibleState: number;
  command: any
}
/**
  * 依赖关系组件子组件
  */
export interface PkgdepItem {
  cve: any,
  label: string,
  collapsibleState: number,
  children: [];
  pkg_vul: string,
  proj_mainfest: string[],
  provenance: string
}