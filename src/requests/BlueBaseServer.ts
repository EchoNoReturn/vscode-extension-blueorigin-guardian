import axios from "axios";
import * as vscode from "vscode";
import { assign } from "lodash";

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
    } finally {
      await this.logout();
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



