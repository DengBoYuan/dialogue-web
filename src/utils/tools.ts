// 工具方法
import '@/locales/en-US'
import enUS from '@/locales/en-US';
import zhCN from '@/locales/zh-CN';
import { toNumber } from 'lodash';

export async function copyObjWhenKeyEqual(source: any, dest: any) {
    for (let key in dest) {
        if (source.hasOwnProperty(key)) {
            dest[key] = source[key];
        }
    }
}

export function changeTime(timestamp: number, format = 'yyyy-MM-dd HH:mm:ss') {
  var date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  const formatMap: { [key: string]: any } = {
    yyyy: year.toString(),
    MM: month.toString().padStart(2, '0'),
    dd: day.toString().padStart(2, '0'),
    HH: hour.toString().padStart(2, '0'),
    mm: minute.toString().padStart(2, '0'),
    ss: second.toString().padStart(2, '0')
  }
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, (match) => formatMap[match])
}

export function checkIsJSON(inputStr: string) {
    if (typeof inputStr == 'string') {
      try {
        var obj = JSON.parse(inputStr);
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
    return false;
}

export function waitTime(time: number = 100) {
    return new Promise((resolve) => {
        setTimeout(() => {
        resolve(true);
        }, time);
    });
};


export function responseCodeMsg(lang: string, code: number) {
    let langMap
    if (lang === 'en-US') {
        langMap = enUS
    } else if (lang == 'zh-CN') {
        langMap = zhCN
    }

    const codeMap = new Map([
        [400, 'request.error.invalid.params'],
        [500, 'request.something.error'],
        
    ]);
    
    return langMap?.[codeMap.get(code)]
}