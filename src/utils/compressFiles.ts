import compressing from 'compressing';
import os from 'os';
import path from 'path';
import fs from 'fs';

/**
 * 拷贝文件夹，并排除指定的文件或文件夹
 * @param source 源目录
 * @param target 目标目录
 */
function cpDir(source: string, target: string) {
  const ignoreList: string[] = ['node_modules', '.git', '.vscode', 'dist','README.md', 'LICENSE']; // 忽略的文件或文件夹
  const isIgnore =
    ignoreList.includes(path.parse(source).base) ||
    ignoreList.includes(path.parse(source).ext);
  if (isIgnore) {
    return;
  }
  if (fs.statSync(source).isDirectory()) {
    fs.mkdirSync(target);
    const files = fs.readdirSync(source);
    files.forEach((file) => {
      cpDir(path.join(source, file), path.join(target, file));
    });
  } else if (fs.statSync(source).isFile()) {
    fs.copyFileSync(source, target);
  }
}

/**
 * 压缩项目目录方法
 * @param dirPath 目标文件夹
 */
export function zipDir(dirPath: string) {
  console.log("准备压缩文件目录", dirPath);
  if (!fs.existsSync(dirPath)) {
    return Promise.reject(new Error("Directory does not exist"));
  }
  const tmpPath = os.tmpdir();
  const dirName = path.basename(dirPath);
  const zipFilePath = path.join(tmpPath, dirName);
  fs.existsSync(zipFilePath) && fs.rmdirSync(zipFilePath, { recursive: true });
  console.log("开始排除忽略目录");
  cpDir(dirPath, zipFilePath);
  console.log("开始压缩文件");
  return compressing.zip.compressDir(zipFilePath, zipFilePath + '.zip')
    .then(() => {
      console.log('压缩完成');
      return zipFilePath + '.zip';
    }).finally(() => {
      fs.existsSync(zipFilePath) && fs.rmSync(zipFilePath, { recursive: true });
    });
}