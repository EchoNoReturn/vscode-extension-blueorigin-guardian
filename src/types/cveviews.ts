import { Cve, CveSeverity, CveType } from "../shared";

export interface CveViewResponse {
  /**
   * 任意片段代码漏洞
   */
  any_snippet_cve: SimpleCveObject;
  pkg_dep_cve: SimpleCveObject;
  vul: VulObject;
  vul_snippet_cve: SimpleCveObject;
}
export interface SimpleCveObject {
  [cveCode: string]: {
    proj_files: string[],
    projs: string[]
    severity: string,
  }
}

export interface VulObject {
  [filePath: string]: {
    [info: string]: Array<Array<number>>
  }
}

/**
 * 漏洞信息
 */
export class CveInfo {
  /**
   * 漏洞代号
   */
  readonly cve: string;
  /**
   * 漏洞类型
   */
  readonly type: CveType;
  /**
   * 影响项目文件
   */
  readonly proj_files: string[] = [];
  /**
   * 影响项目
   */
  readonly projs: string[] = [];
  /**
   * 漏洞严重性
   */
  readonly severity: CveSeverity;
  /**
   * @param cve 漏洞代号
   * @param type 漏洞类型
   * @param proj_files 影响文件列表
   * @param projs 影响项目列表
   * @param severity 严重性
   */
  constructor(
    cve: string,
    type: CveType,
    proj_files?: string[],
    projs?: string[],
    severity: CveSeverity = CveSeverity.UNKNOWN,
  ) {
    this.cve = cve;
    this.type = type;
    this.severity = severity;
    proj_files && (this.proj_files = proj_files);
    projs && (this.projs = projs);
  }
}

export class VulData {
  /**
   * 漏洞影响代码文件路径
   */
  readonly filePath: string;
  /**
   * 漏洞代号
  */
  readonly cve: string;
  /**
   * 漏洞严重性。
   * 初始化时默认是UNKNOWN，需要在外边匹配修改
   */
  severity: CveSeverity = CveSeverity.UNKNOWN;
  /**
   * 匹配组件库的拥有者
   */
  readonly matchRepositoryOwner: string;
  /**
   * 匹配组件库名称
   */
  readonly matchRepositoryName: string;
  /**
   * 匹配提交ID
   */
  readonly matchCommitId: string;
  /**
   * 匹配差异提交ID
   */
  readonly matchDiffCommitId: string;
  /**
   * 匹配组件库文件路径
   */
  readonly matchFilePath: string;
  /**
   * 代码片段的行号
   */
  readonly codelines: Array<Array<number>>;
  /**
   * 原漏洞信息
   */
  readonly info: string;

  constructor(filePath: string, info: string, codeLines: Array<Array<number>>) {
    const infoSplits = info.split('__//__');
    this.filePath = filePath;
    this.cve = infoSplits[0];
    this.matchRepositoryOwner = infoSplits[1];
    this.matchRepositoryName = infoSplits[2];
    this.matchCommitId = infoSplits[3];
    this.matchFilePath = infoSplits[4];
    this.matchDiffCommitId = infoSplits[5];
    this.codelines = codeLines;
    this.info = info;
  }
}