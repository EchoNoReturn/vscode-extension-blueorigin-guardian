/**
 * 所有许可证分类
 */
export interface LicensesResponse {
  /**
   * 所有许可证
   */
  licensesData: LicensesItem[],
  /**
   * 合规许可证
   */
  compliantLicenses: LicensesItem[],
  /**
   * 不合规许可证
   */
  unCompliantLicenses: LicensesItem[],
  /**
   * 未定义许可证
   */
  undefinedLicenses: LicensesItem[],
}
/**
 * 所有许可证子组件
 */
export interface LicensesItem {
  /**
   * 许可证子名称
   */
  label: string,
  /**
   * 合规性
   */
  compliance: string,
  proj_files: string[],
  projs: string[],
  /**
   * 是否有子目录
   */
  children: [],
  /**
   * 是否展开 0是不展开，1是展开
   */
  collapsibleState: number,
  /**
   * 点击命令
   */
  commad: any
}