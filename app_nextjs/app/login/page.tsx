"use client";

// login.tsx
import React, { useState } from 'react'; // 导入React和useState钩子
import axios from 'axios'; // 导入axios用于发送HTTP请求
import "../css/login.css";
// import Home from '../homedaohan/page'; // 引入Sidebar组件


const LoginPage = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');

  // 定义handleSubmit函数，处理表单提交事件
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', {
        username,
        password,
      });
      
      console.log('Response from server:', response);
      if (response.data.auth) {
        // 将token存储到localStorage
        localStorage.setItem('token', response.data.token);
        
        // 使用window.location.href进行页面跳转
        window.location.href = '/home';
      }
    } catch (error) {
      console.error('登录失败:', error);
      alert('登录失败，请重试！');
    }
  };

  return (
    <div>
          {/* <Home /> */}
    <form onSubmit={handleSubmit}>
      <h1>登录</h1>
      <input
        type="text"
        placeholder="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">登录</button>
    </form>
    </div>

  );
};

export default LoginPage;