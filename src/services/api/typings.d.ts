// @ts-ignore
/* eslint-disable */

declare namespace API {
    type ResponseParams = {
      code?: number;
      msg?: string;
      data?: any;
    };

    type FakeCaptcha = {
      code?: number;
      status?: string;
    };

    type LoginParams = {
      user_email?: string;
      user_pwd?: string;
      type?: string;
      autoLogin?: boolean;
    };

    type CaptchaParams = {
      length?: number;
      width?: number;
      height?: number;
      type?: string;
      lang?: string;
    }

    type IdParams = {
      id?: string;
    }

    type CaptchaVerifyParams = {
      captcha_id?: string;
      code?: string;
    }
  
  }