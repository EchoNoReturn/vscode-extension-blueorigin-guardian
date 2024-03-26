
export interface LicensesResponse {
  licensesData: LicensesItem[],
  compliantLicenses: LicensesItem[],
  unCompliantLicenses: LicensesItem[],
  undefinedLicenses: LicensesItem[],
}
export interface LicensesItem {
  label: string,
  compliance: string,
  proj_files: string[],
  projs: string[],
  children: [],
  collapsibleState: number,
  commad: any
}