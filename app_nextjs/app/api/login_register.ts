// api.ts
import axios from 'axios';

// 定义请求体类型
export type UserCredentials = {
  username: string;
  password: string;
};

// 基础URL
const BASE_URL = 'http://localhost:3000';

// 注册用户
export const registerUser = (credentials: UserCredentials) => {
  return axios.post(`${BASE_URL}/register`, credentials, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// 登录用户
// export const loginUser = (credentials: UserCredentials) => {
//   return axios.post(`${BASE_URL}/login`, credentials, {
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });
// };