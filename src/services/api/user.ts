import { request } from '@umijs/max';

export async function queryAllUserList(
    params: {
      
    },
    options?: { [key: string]: any },
  ) {
    return request<API.Result_PageInfo_UserInfo__>('/user/all', {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    });
  }