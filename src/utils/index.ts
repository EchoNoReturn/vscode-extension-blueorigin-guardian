import path from "path";

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
 * 处理compliant、not compliant、undefined为中文合规、不合规、未定义
 */
export const compliance = (node: string) => {
  if (node === "compliant") {
    return `<span class="green">合规</span>`;
  } else if (node === "not compliant") {
    return '<span class="red">不合规</span>';

  } else if (node === "partial compliant") {
    return '<span class="yellow">部分合规</span>';
  }
  else {
    return '<span class="grey">未定义</span>';
  }
};

/**
 * 通过文件路径中的文件后缀确定语言类型
 * @param filePath 文件路徑
 * @returns 语言类型
 */
export function getLanguage(filePath: string) {
  const ext = path.extname(filePath);
  const language = ext.slice(1);
  if (['js', 'jsx'].includes(language)) {
    return "javascript";
  } else if (['ts', 'tsx'].includes(language)) {
    return "typescript";
  } else if (language === "py") {
    return "python";
  } else {
    return language;
  }
}
/**
 * 处理当前文件item数据
 */
export const currentFilesItem = (item: any, index: number, match: string) => {
  const it_item = item;
  it_item.label = `${item.author}/${item.artifact}:${item.version}`;
  it_item.children = [];
  it_item.collapsibleState = 0;
  it_item.command = {
    command: 'blue.currentFileData', // 使用你注册的命令的标识符  
    title: 'Open Repo', // 命令的标题，显示在 UI 上（可选）  
    arguments: [it_item] // 传递给命令的参数，这里传递了当前的 ExplorerNode  
  };
  if (it_item.homepage === 'null') {
    const abc = it_item.fpath.split('/');
    const it_item1 = abc[0].slice(
      0,
      abc[0].lastIndexOf('-'),
    );
    const it_item2 = it_item1.slice(
      0,
      it_item1.lastIndexOf('-'),
    );
    const it_item3 = it_item1.slice(
      it_item1.lastIndexOf('-') + 1,
    );
    it_item.homepageMain = `https://github.com/${it_item2}/${it_item3}`;
  } else {
    it_item.homepageMain = it_item.homepage;
  }
  it_item.repos = `${item.author}/${item.artifact}`;
  it_item.key = item.artifact + index;
  it_item.full = match;
  it_item.hitsMain = item.hits.slice(
    0,
    item.hits.indexOf(','),
  );
  return it_item;
};