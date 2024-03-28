/**
 * 处理时间格式
 */
export function formatDate(isoString: string) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以加1，并用0填充到两位数  
  const day = String(date.getDate()).padStart(2, '0'); // 用0填充到两位数  
  const hours = String(date.getHours()).padStart(2, '0'); // 用0填充到两位数  
  const minutes = String(date.getMinutes()).padStart(2, '0'); // 用0填充到两位数  
  const seconds = String(date.getSeconds()).padStart(2, '0'); // 用0填充到两位数  

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
/**
 * 处理合规、不合规、未定义
 */
export const compliance = (node: string) => {
  if (node === "compliant") {
    return `<span class="green">合规</span>`;
  } else if (node === "not compliant") {
    return '<span class="red">不合规</span>';

  } else {
    return '<span class="grey">未定义</span>';
  }
};