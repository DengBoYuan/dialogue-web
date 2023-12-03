import { Footer, CaptchaInput } from '@/components';
import { login } from '@/services/api/auth';
import { getFakeCaptcha } from '@/services/api/login';
import { captchaVerify } from '@/services/api/auth'
import {
  LockOutlined,
  MobileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { FormattedMessage, history, SelectLang, useIntl, useModel, Helmet } from '@umijs/max';
import { Alert, message, Tabs, Typography } from 'antd';
import Settings from '../../../config/defaultSettings';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';

const { Text, Link } = Typography;

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.ResponseParams>({});
  const [type, setType] = useState<string>('account');
  const [captchaListen, setCaptchaListen] = useState<number>(0);
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [captchaKey, setCaptchaKey] = useState<string>('');
  const { initialState, setInitialState } = useModel('@@initialState');

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('/assets/login_bg.png')",
      backgroundSize: '100% 100%',
    };
  });

  const intl = useIntl();

  const fetchUserInfo = async (userId: string) => {
    const userInfo = await initialState?.fetchUserInfo?.("/login", "id", userId);
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    if (captchaCode === '') {
      message.warning(intl.formatMessage({
          id: 'pages.login.captcha.placeholder',
          defaultMessage: '请输入验证码',
      }))
      return
    }
    try {
      // 验证码
      const capMsg = await captchaVerify({captcha_id: captchaKey, code: captchaCode})
      if (capMsg.code === 200) {
        // 登录
        const msg = await login({ ...values, type });
        let userEmail = typeof values.user_email === "undefined"?"":values.user_email
        
        localStorage.setItem('user_email', userEmail);
        localStorage.setItem('auto_login', values.autoLogin?"true":"false")

        if (msg.code === 200) {
          const defaultLoginSuccessMessage = intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          });
          localStorage.setItem('at', msg.data.access_token)
          localStorage.setItem('rt', msg.data.refresh_token)
          localStorage.setItem('uid', msg.data.user_id)
          localStorage.setItem('rid', msg.data.role_id)
          message.success(defaultLoginSuccessMessage);
          await fetchUserInfo(msg.data.user_id);
          const urlParams = new URL(window.location.href).searchParams;
          history.push(urlParams.get('redirect') || '/auto/index');
          return;
        }
        msg.data = type
        // 如果失败去设置用户错误信息
        setUserLoginState(msg);
      }
      setCaptchaListen(captchaListen + 1)
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultLoginFailureMessage);
    }
  };
  const { code, data: loginType } = userLoginState;

  const handleSetCaptcha = (captchaKey: string, captchaCode: string) => {
    if(captchaCode !== '') {
      setCaptchaCode(captchaCode)
    }
    if (captchaKey !== '') {
      setCaptchaKey(captchaKey)
    }
  }

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/favicon.ico" />}
          title="Auto Code"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            <FormattedMessage
              key="no_account_tip"
              id="pages.login.notAccountTip"
              defaultMessage="没有账号？"
            />,
            <Text key="click_icon">☞ </Text>,
            <Link href="/" key="click_here_get_link" target="_blank">
              {intl.formatMessage({ id: 'pages.login.clikHereGet' })}
            </Link>
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '账户密码登录',
                }),
              },
              {
                key: 'mobile',
                label: intl.formatMessage({
                  id: 'pages.login.phoneLogin.tab',
                  defaultMessage: '手机号登录',
                }),
              },
            ]}
          />

          {code !== 200 && loginType === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误',
              })}
            />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="user_email"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.account.placeholder',
                  defaultMessage: '账号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.account.required"
                        defaultMessage="账号是必填项！"
                      />
                    ),
                  },
                  { 
                    required: true, 
                    pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/, 
                    message: (
                      <FormattedMessage
                        id="tip.email.format.error"
                        defaultMessage="邮箱格式有误"
                      />
                    ),
                  }
                ]}
              />
              <ProFormText.Password
                name="user_pwd"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="密码是必填项！"
                      />
                    ),
                  },
                  { 
                    required: true, 
                    pattern: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\\W_!@#$%^&*`~()-+=]+$)(?![0-9\\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\\W_!@#$%^&*`~()-+=]{8,30}$/, 
                    message: (
                      <FormattedMessage
                        id="tip.pwd.format.error"
                        defaultMessage="密码中数字、小写、大写、特殊字符，至少满足3个"
                      />
                    ),
                  }
                ]}
              />
              <CaptchaInput captchaListen={captchaListen} onChange={handleSetCaptcha} />
            </>
          )}

          {code !== 200 && loginType === 'mobile' && <LoginMessage content={intl.formatMessage({ id: 'pages.login.phoneLogin.errorMessage' })} />}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '获取验证码',
                    })}`;
                  }
                  return intl.formatMessage({
                    id: 'pages.login.phoneLogin.getVerificationCode',
                    defaultMessage: '获取验证码',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  message.warning('暂不支持获取验证码')
                  // const result = await getFakeCaptcha({
                  //   phone,
                  // });
                  // if (!result) {
                  //   return;
                  // }
                  // message.success('获取验证码成功！');
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
