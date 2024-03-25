/**
 * 公共数据、参数、枚举都放在这里
 */

/**
 * 组件漏洞类型
 */
enum CveType {
  VUL_SNIPPET_CVE = "1.漏洞库片段代码匹配",
  PKG_DEP_CVE = "2.依赖关系匹配",
  ANY_SNIPPET_CVE = "3.通用片段代码匹配",
}

namespace CveType {
  /**
   * 把字符串准尉枚举值
   */
  export function parseString(s: string) {
    switch (s.toUpperCase()) { 
      case "1.Vulnerability snippet match":
        return CveType.VUL_SNIPPET_CVE;
      case "2.Package dependency":
        return CveType.PKG_DEP_CVE;
      case "3.Generic snippet match":
        return CveType.ANY_SNIPPET_CVE;
      default:
        throw new Error("Unknown CveType: " + s);
    }
  }
}

export default {
  CveType
};