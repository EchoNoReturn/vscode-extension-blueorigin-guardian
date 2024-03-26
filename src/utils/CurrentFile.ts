/**
 * 开源库、漏洞数据处理
 */
export const getfileHandle = (data: any) => {
  const t: any = Object.values(
    JSON.parse(data.scan_result),
  );
  //完全匹配开源库
  const fullList: any = []
  //部分匹配开源库
  const partialList: any = []
  //漏洞
  const cveList: any = []
  //完全匹配开源库数据处理
  t[0].full_match.forEach(
    (item: any, index: number) => {
      const it = item;
      if (it.homepage === 'null') {
        const abc = it.fpath.split('/');
        const t1 = abc[0].slice(
          0,
          abc[0].lastIndexOf('-'),
        );
        const t2 = t1.slice(
          0,
          t1.lastIndexOf('-'),
        );
        const t3 = t1.slice(
          t1.lastIndexOf('-') + 1,
        );
        it.homepage2 = `https://github.com/${t2}/${t3}`;
      } else {
        it.homepage2 = it.homepage;
      }

      it.repos = `${item.author}/${item.artifact}`;
      it.score = `${item.score}`;
      it.key = item.artifact + index;
      it.full = 'full (100%)';
      it.hits2 = item.hits.slice(
        0,
        item.hits.indexOf(','),
      );
      fullList.push(it);
      //漏洞不为空，添加漏洞
      if (it.cve !== '') {
        cveList.push(it)
      }
    },
  );
  //部分匹配开源库数据处理
  t[0].snippet_match.forEach(
    (item: any, index: number) => {
      const it = item;
      if (it.homepage === 'null') {
        const abc = it.fpath.split('/');
        const t1 = abc[0].slice(
          0,
          abc[0].lastIndexOf('-'),
        );
        const t2 = t1.slice(
          0,
          t1.lastIndexOf('-'),
        );
        const t3 = t1.slice(
          t1.lastIndexOf('-') + 1,
        );
        it.homepage2 = `https://github.com/${t2}/${t3}`;
      } else {
        it.homepage2 = it.homepage;
      }
      it.repos = `${item.author}/${item.artifact}`;
      it.score = `${item.score}`;
      it.key = item.artifact + index;
      it.full = 'partial';
      it.hits2 = item.hits.slice(
        0,
        item.hits.indexOf(','),
      );
      partialList.push(it);
      //漏洞不为空，添加漏洞
      if (it.cve !== '') {
        cveList.push(it)
      }
    },
  );

  return { fullList, partialList, cveList }
}
/**
 * 字符串模糊匹配
 */
export const fuzzyMatch = (str: string, pattern: string) => {
  const regex = new RegExp(pattern, 'i'); // 'i' 表示不区分大小写  
  return regex.test(str);
}  