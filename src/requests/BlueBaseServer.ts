import axios from "axios";
import * as vscode from "vscode";
import { assign } from "lodash";
import path from 'path';
import fs from 'fs';
import FormData from "form-data";

/**
 * 蓝源卫士服务
 */
const reqBlue = new class {
  private readonly config = vscode.workspace.getConfiguration('blueOriginGuardian');
  private readonly baseUrl = this.config.get('serverAddr') + '';
  private readonly user = this.config.get('login') + '';
  private readonly password = this.config.get('password') + '';
  private token: string = "";
  private readonly baseServer = axios.create({
    baseURL: this.baseUrl,
  });

  /**
   * 通用请求方法
   * @param url
   * @param data 
   * @returns
   */
  async postData(url: string, data: any = {}) {
    await this.login();
    const basePayload = {
      user: this.user,
      token: this.token,
    };
    try {
      const payload = assign(basePayload, data);
      const result = await this.baseServer.post(url, payload);
      return result;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * 上传文件到蓝源卫士，项目名称默认为zip文件的名称
   * @param zipFilePath zip文件路径
   */
  async uploadFile(zipFilePath: string) {
    await this.login();
    const projectName = path.basename(zipFilePath, '.zip');
    const formData = new FormData();
    formData.append('user', this.user);
    formData.append('token', this.token);
    formData.append('projectname', projectName);
    formData.append('scope', this.config.get('scope'));
    try {
      const file = fs.createReadStream(zipFilePath);
      console.log('file', file);
      formData.append('file', file, { filename: projectName + '.zip' });
      console.log("成功获取压缩包流");
      formData.getLength((err, length) => {
        if (err) {
          console.error(err);
          throw err;
        }
        console.log("formData.getLengthSync()", length);
        this.baseServer.post('/local2/submitproject', formData, {
          headers: {
            'Content-Type': formData.getHeaders()['content-type'],
            'content-length': length
          }
        }).then((res) => {
          console.log(res.data);
          vscode.window.showInformationMessage('蓝源卫士：上传成功。扫描中...');
          fs.rmSync(zipFilePath);
          console.log('文件删除成功！', zipFilePath);
        }).catch(err => {
          console.error(err);
          throw err;
        });
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * 登录
   */
  private async login() {
    const payload = {
      user: this.user,
      passwd: this.password,
    };
    // 调用basServer的login接口
    try {
      const res = await this.baseServer.post('/local2/login', payload);
      // 登录成功后的处理逻辑
      res.data.token && (this.token = res.data.token);
      console.log('登录成功:', this.token);
    } catch (error) {
      // 登录失败后的处理逻辑
      vscode.window.showErrorMessage('登录失败');
    }
  }

  /**
   * 登出
   */
  private async logout() {
    const payload = {
      user: this.user,
      token: this.token,
    };
    try {
      await this.baseServer.post('/local2/logout', payload);
      // 登出成功后的处理逻辑
      console.log("登出成功", this.token);
      this.token = '';
    } catch (error) {
      // 登出失败后的处理逻辑
      vscode.window.showErrorMessage('登出失败');
    }
  }
};

export default reqBlue;
