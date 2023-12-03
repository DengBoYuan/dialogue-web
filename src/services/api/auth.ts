import { request } from '@umijs/max';
import { encode } from 'base-64';

/** 发送验证码 POST /api/login/captcha */
export async function getFakeCaptcha(
    params: {
      // query
      /** 手机号 */
      phone?: string;
    },
    options?: { [key: string]: any },
  ) {
    return request<API.FakeCaptcha>('/api/login/captcha', {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    });
  }

/** 认证 POST /api/auth */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  if (body.user_pwd) {
    body.user_pwd = encode(body.user_pwd)
  }

  delete body.autoLogin;

  return request<API.ResponseParams>('/api/auth', {
    method: 'POST',
    credentials:'include',
    data: body,
    ...(options || {}),
  });
}

/** 刷新token GET /api/auth/refresh */
export async function refreshToken(options?: { [key: string]: any }) {
  return request<API.ResponseParams>('/api/auth/refresh', {
    method: 'GET',
    credentials:'include',
    headers: {},
    ...(options || {}),
  });
}

/** 退出登录 POST /api/inner/user/logout */
export async function outLogin(body: API.IdParams, options?: { [key: string]: any }) {
  return request<API.ResponseParams>('/api/inner/user/logout', {
    method: 'POST',
    credentials:'include',
    data: body,
    ...(options || {}),
  });
}

/** 获取验证码 POST /api/auth/captcha */
export async function captcha(body: API.CaptchaParams, options?: { [key: string]: any }) {
  return request<API.ResponseParams>('/api/auth/captcha', {
    method: 'POST',
    credentials:'include',
    data: body,
    ...(options || {}),
  });
}

/** 验证验证码 POST /api/auth/captcha/verify */
export async function captchaVerify(body: API.CaptchaVerifyParams, options?: { [key: string]: any }) {
  return request<API.ResponseParams>('/api/auth/captcha/verify', {
    method: 'POST',
    credentials:'include',
    data: body,
    ...(options || {}),
  });
}