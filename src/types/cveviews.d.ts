export interface CveViewResponse {
  /**
   * 任意片段代码漏洞
   */
  any_snippet_cve: SnippetCve;
  pkg_dep_cve: PkgDepCve;
  vul: Vul;
  vul_snippet_cve: SnippetCve;
}
interface SnippetCve {
  [cveCode: string]: {
    proj_files: string[],
    projs: string[]
    serverity: string,
  }
}

interface PkgDepCve {
  [cveCode: string]: {
    proj_files: any[],
    projs: string[],
    serverity: string,
  }
}

interface Vul {
  [filePath: string]: {
    [info: string]: Array<Array<number>>
  }
}
