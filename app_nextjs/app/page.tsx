"use client";

// // HomePage.tsx
import React from 'react';
import styles from '../app/css/HomePage.module.css'; // 假设你使用CSS模块

const HomePage: React.FC = () => {
  // 定义一个处理函数，用于处理按钮点击事件
  const handleStartClick1 = () => {
    window.location.href = '/login'; // 当按钮被点击时，跳转到登录页面
  };
  const handleStartClick2 = () => {
    window.location.href = '/register'; // 当按钮被点击时，跳转到登录页面
  };

  return (
    <div className={styles.container}>
      <h1>欢迎使用错题库管理系统</h1>
      <p>这里是您的个人学习助手，帮助您高效管理并复习错题。</p>
       {/* 你可以添加一些图片或者额外的介绍信息 */}
       <div className={styles.features}>
        <h2>主要功能：</h2>
        <ul>
          <li>错题收集与分类</li>
          {/* <li>智能复习计划</li> */}
          {/* <li>个性化学习报告</li> */}
          {/* <li>多设备同步</li> */}
        </ul>
        </div>
      <button className={styles.button} onClick={handleStartClick1}>
        立即开始
      </button>
      <br />
      <button className={styles.button} onClick={handleStartClick2}>
        没有账号？注册
      </button>
    </div>
  );
};

export default HomePage;