import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { request, getLocale } from '@umijs/max';
import { message, notification } from 'antd';
import { responseCodeMsg } from '@/services/utils/tools'

// 是否正在刷新的标记
let isRefreshing = false
// 重试队列，每一项将是一个待执行的函数形式
let retryRequests: (() => void)[] = []

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 设置全局寄出请求域名
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,


  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        message.error(`Response status: ${error.response.data.msg}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      // const url = config?.url?.concat('?token = 123');
      const url = config?.url
      let authHeader = {};

      if (url?.includes('upload')) {
        authHeader = { 
          'Authorization': `Bearer ${localStorage.getItem('at')}`,
          'Content-Type': 'multipart/form-data',
        };
      } else if (url?.includes('inner')) {
        authHeader = { 
          'Authorization': `Bearer ${localStorage.getItem('at')}`,
          'Content-Type': 'application/json;charset=utf-8',
        };
      } else if (url?.includes('auth/refresh')) {
        authHeader = { 
          'Authorization': `Bearer ${localStorage.getItem('rt')}`,
          'Content-Type': 'application/json;charset=utf-8',
        };
      }
      
      return { ...config, interceptors: true, url, headers: authHeader };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    async (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as API.ResponseParams;
      if (data.code === 20001 || data.code === 20002) {
        const config = response.config
        // if (!isRefreshing) {
        //   isRefreshing = true
        //   try {
        //     await refreshToken().then((result) => {
        //       if (result.code === 200 && result.msg === "ok") {
        //         localStorage.setItem('at', result.data.access_token)
        //         localStorage.setItem('rt', result.data.refresh_token)
        //         console.log("放假啦是否")
        //       }
        //     })
        //     console.log("阿帆数控刀具阿斯蒂芬")
            
        //     // 已经刷新了token，将所有队列中的请求进行重试
        //     console.log(retryRequests.length)
        //     retryRequests.forEach(cb => cb())
        //     // 重试完清空这个队列
        //     retryRequests = []

        //     let body = '{}'
        //     // 这边不需要baseURL是因为会重新请求url，url中已经包含baseURL的部分了
        //     if (config.method === 'post' || config.method === 'put') {
        //       body = qs.parse(config.data)
        //     }
        //     isRefreshing = false
        //     return request<{
        //       data: API.ResponseParams;
        //     }>(config.url, {
        //       method: config.method,
        //       credentials:'include',
        //       params: config.params,
        //       data: body,
        //     })
        //   } catch (error) {
        //       isRefreshing = false
        //   }
        // } else {
        //   return new Promise((resolve) => {
        //     // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
        //     retryRequests.push(() => {
        //       let body = '{}'
        //       if (config.method === 'post' || config.method === 'put') {
        //           body = qs.parse(config.data)
        //       }

        //       resolve(request<{
        //         data: API.ResponseParams;
        //       }>(config.url, {
        //         method: config.method,
        //         credentials:'include',
        //         params: response.config.params,
        //         data: body,
        //       }))
        //     })
        //   })
        // }
        
        const refreshRes = await refreshToken() as API.ResponseParams
        if (refreshRes.code === 200) {
          localStorage.setItem('at', refreshRes.data.access_token)
          localStorage.setItem('rt', refreshRes.data.refresh_token)
          
          response.data = await request<{
            data: API.ResponseParams;
          }>(config.url, {
            method: config.method,
            credentials:'include',
            params: config.params,
            data: config.data,
          })
        }
        
        // return response;
        
        // // console.log(response.config.headers.Authorization)
        // 二进制流文件下载
        // if (response.headers['content-type'] === "application/octet-stream;charset=UTF-8") {
        //     return response;
        // } else {
        //     return response.data;
        // }
      } else if (data.code !== 200) {
        message.error(responseCodeMsg(getLocale(), data.code))
      }

      return response;
      //  else if (data.code !== 200) {
      //   message.error(`Response status: ${data.msg}`);
      //   return response
      // } else {
      //   return response;
      // }
    },
  ],
};
