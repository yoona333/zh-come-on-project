"use client";

// // HomePage.tsx
import React, { useEffect } from 'react';
import styles from '../app/css/HomePage.module.css'; // 假设你使用CSS模块
import { useRouter } from 'next/navigation';

const HomePage: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    // 重定向到登录页面
    router.push('/login');
  }, [router]);
  
  return null;
};

export default HomePage;