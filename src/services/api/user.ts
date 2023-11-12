import { request } from '@umijs/max';

export async function queryAllUserList(
    params: {
      
    },
    options?: { [key: string]: any },
  ) {
    return request<API.Result_PageInfo_UserInfo__>('http://localhost:8080/user/all', {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    });
  }