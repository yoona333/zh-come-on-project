"use client";


// register.tsx
import React, { useState } from 'react';
import '../css/register.css';
import { registerUser } from '../api/login_register'; // 确保路径正确
// import Home from '../homedaohan/page'; // 引入Sidebar组件


const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await registerUser({ username, password });
      if (response.status === 201) {
        alert('注册成功，请登录！');
        window.location.href = '/login'; // 注册成功后跳转到登录页面
      }
    } catch (error) {
      console.error('注册失败:', error);
      alert('注册失败，请重试！');
    }
  };

  return (
    <div>
          {/* <Home /> */}
    <form onSubmit={handleSubmit}>
      <h1>注册</h1>
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
      <button type="submit">注册</button>
    </form>
    </div>
  );
};

export default RegisterPage;