// // api.ts
// import axios from 'axios';

// // 定义请求体类型
// export type UserCredentials = {
//   username: string;
//   password: string;
// };

// // 基础URL
// const  = 'http://localhost:8001';

// // 注册用户
// export const registerUser = (credentials: UserCredentials) => {
//   return axios.post(`${BASE_URL}/register`, credentials, {
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });
// };

// // 登录用户
// // export const loginUser = (credentials: UserCredentials) => {
// //   return axios.post(`${BASE_URL}/login`, credentials, {
// //     headers: {
// //       'Content-Type': 'application/json'
// //     }
// //   });
// // };

/**
 * 登录接口
 * @param username 用户名
 * @param password 密码
 * @returns 返回用户信息和token
 */
export const login = async (username: string, password: string) => {
  try {
    const response = await fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      // 保存用户信息到localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('role', data.user.role.toString());
      localStorage.setItem('userId', data.user.id.toString());
      
      return {
        success: true,
        data: data.user,
        token: data.token
      };
    }
    
    return {
      success: false,
      message: data.message || '登录失败'
    };
  } catch (error) {
    console.error('登录请求异常:', error);
    return {
      success: false,
      message: '服务器异常，请稍后再试'
    };
  }
};

/**
 * 注册接口
 * @param username 用户名
 * @param password 密码
 * @param email 邮箱
 * @returns 返回注册结果
 */
export const register = async (username: string, password: string, email: string) => {
  try {
    const response = await fetch('http://localhost:8080/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        username, 
        password, 
        email,
        role: 1 // 默认为学生角色
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return {
        success: true,
        message: '注册成功'
      };
    }
    
    return {
      success: false,
      message: data.message || '注册失败'
    };
  } catch (error) {
    console.error('注册请求异常:', error);
    return {
      success: false,
      message: '服务器异常，请稍后再试'
    };
  }
};