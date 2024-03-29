/**
 * 公共数据、参数、枚举都放在这里
 */

/**
 * 组件漏洞类型
*/
export enum CveType {
  VUL_SNIPPET_CVE = "漏洞库片段代码匹配",
  PKG_DEP_CVE = "依赖关系匹配",
  ANY_SNIPPET_CVE = "通用片段代码匹配",
}

/**
 * 漏洞严重性
 */
export enum CveSeverity {
  HIGH = "高危漏洞",
  MEDIUM = "中危漏洞",
  LOW = "低危漏洞",
  UNKNOWN = "未定义"
}

/**
 * 项目状态
 */
export enum ProjectStatus {
  STARTED = "正在扫描",
  FINISHED = "完成",
  ERROR = "错误",
  PENDING = "等待中",
  UNKNOWN = "未知"
}

export namespace Project {
  export function parseStatusString(s: string) {
    switch (s) {
      case "started":
        return ProjectStatus.STARTED;
      case "finished":
        return ProjectStatus.FINISHED;
      case "error":
        return ProjectStatus.ERROR;
      case "pending":
        return ProjectStatus.PENDING;
      default:
        return ProjectStatus.UNKNOWN;
    }
  }
}
export namespace Cve {
  /**
  * 把字符串准尉枚举值
  */
  export function parseTypeString(s: string) {
    switch (s) {
      case "vul_snippet_cve":
        return CveType.VUL_SNIPPET_CVE;
      case "pkg_dep_cve":
        return CveType.PKG_DEP_CVE;
      case "any_snippet_cve":
        return CveType.ANY_SNIPPET_CVE;
      default:
        throw new Error("Unknown CveType: " + s);
    }
  }

  /**
   * 漏洞严重性字符串转枚举值
   * @param s 需要转换的字符串
   */
  export function parseSeverityString(s: string) {
    switch (s.toUpperCase()) {
      case "HIGH":
        return CveSeverity.HIGH;
      case "MEDIUM":
        return CveSeverity.MEDIUM;
      case "LOW":
        return CveSeverity.LOW;
      default:
        return CveSeverity.UNKNOWN;
    }
  }
}
