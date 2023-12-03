import React, {useState, useEffect} from 'react';
import {Input, message} from 'antd';
import {SafetyCertificateOutlined} from '@ant-design/icons';
import { captcha } from '@/services/api/auth';
import { request, useIntl } from '@umijs/max';

interface CaptchaInputProps {
  captchaListen?: number;
  onChange?: (captchaKey: string, captchaCode: string) => void;
}
  
const CaptchaInput: React.FC<CaptchaInputProps> = ({captchaListen, onChange}) => {
  
  const intl = useIntl();
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [captchaKey, setCaptchaKey] = useState<string>('');
  const [imageData, setImageData] = useState<string>('');

  const getCaptcha = async () => {
    try {
      const data = await captcha({"length": 6, "width": 107, "height": 36, "type": "string", "lang": "zh"});
      if (data.code === 200) {
        return data.data;
      }
      return data
    } catch (error) {
      message.error(intl.formatMessage({
        id: 'tip.captcha.get.errorMessage',
        defaultMessage: '获取验证码失败',
      }));
      return {'content': '', 'captchaKey': ''};
    }
  }
  
  // 触发改变
  const triggerChange = (changedValue: { captchaCode?: string; captchaKey?: string }) => {
    if (onChange) {
      onChange(changedValue.captchaKey || '', changedValue.captchaCode || '');
    }
  };
  
  useEffect(() => {
    getCaptcha().then((data: any) => {
      setCaptchaKey(data.captchaKey);
      setImageData(data.content);
      triggerChange({captchaKey: data.captchaKey});
    })
  }, [captchaListen]);
  
  
  // 输入框变化
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value || '';
    if (code !== '') {
      setCaptchaCode(code);
    }
    triggerChange({captchaCode: code});
  }
  
  // 时间类型变化
  const onClickImage = () => {
    getCaptcha().then((data: any) => {
      setCaptchaKey(data.captchaKey);
      setImageData(data.content);
      triggerChange({captchaKey: data.captchaKey});
    })
  };
  
  return (
    <span>
       <Input.Group compact>
          <Input prefix={<SafetyCertificateOutlined />} placeholder={intl.formatMessage({
            id: 'pages.login.captcha.placeholder',
            defaultMessage: '请输入验证码',
          })}
                 onChange={onChangeInput}
                 style={{width: '75%', marginRight: 5, padding: '6.5px 11px 6.5px 11px', verticalAlign: 'middle'}}/>
                   <img style={{width: '23%', height: '35px', verticalAlign: 'middle', padding: '0px 0px 0px 0px'}}
                        src={imageData} onClick={onClickImage}/>
       </Input.Group>
    </span>
  );
};
export default CaptchaInput;