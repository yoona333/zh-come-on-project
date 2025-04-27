'use client';

import { useState, useEffect } from 'react';
import { Layout, message } from 'antd';
import Header from '../../src/components/ui/Header';
import Sidebar from '../../src/components/ui/Sidebar';
import styles from '../../src/styles/Layout.module.scss';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import MultiLoginTips from '../components/MultiLoginTips';
import SessionStorageInfo from '../components/SessionStorageInfo';

const { Content } = Layout;

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '用户',
    isClubLeader: false,
    avatar: ''
  });
  const [showLoginTips, setShowLoginTips] = useState(false);
  const router = useRouter();
  
  // 在客户端加载时获取用户信息
  useEffect(() => {
    const validateSession = async () => {
      // 检查使用的是哪种存储方式（localStorage或sessionStorage）
      const authMode = sessionStorage.getItem('auth_mode');
      const storage = authMode === 'session' ? sessionStorage : localStorage;
      const token = storage.getItem('token');
      
      if (!token) {
        message.error('请先登录');
        router.push('/login');
        return;
      }
      
      try {
        // 每次加载页面时重新验证用户身份
        const response = await axios.get('http://localhost:8080/api/user/profile', {
          headers: { 'x-access-token': token }
        });
        
        if (!response.data.success) {
          message.error('会话已过期，请重新登录');
          router.push('/login');
          return;
        }
        
        const userData = response.data.data;
        const actualRole = userData.role.toString();
        const storedRole = storage.getItem('role');
        
        // 如果存储的角色与实际角色不匹配，更新storage
        if (storedRole !== actualRole) {
          storage.setItem('role', actualRole);
          setShowLoginTips(true); // 显示多角色登录提示
        }
        
        // 判断是否有权限访问学生页面
        if (actualRole !== '1' && actualRole !== '2') {
          message.error('您没有权限访问此页面');
          router.push('/login');
          return;
        }
        
        // 设置用户信息
        setUserInfo({
          name: userData.username || '用户',
          isClubLeader: actualRole === '2',
          avatar: userData.avatar || ''
        });
      } catch (error) {
        console.error('验证会话失败:', error);
        message.error('验证用户身份失败，请重新登录');
        router.push('/login');
      }
    };
    
    validateSession();
    
    // 检查是否在多个标签页中打开了系统
    const checkMultipleWindows = () => {
      // 如果使用的是sessionStorage模式，则不需要检查多窗口冲突
      if (sessionStorage.getItem('auth_mode') === 'session') {
        return;
      }
      
      const lastAccessTime = localStorage.getItem('lastAccessTime');
      const currentTime = new Date().getTime();
      
      if (lastAccessTime && currentTime - parseInt(lastAccessTime) < 5000) {
        // 如果在短时间内有其他页面访问过系统，可能存在多窗口问题
        setShowLoginTips(true);
      }
      
      // 更新访问时间
      localStorage.setItem('lastAccessTime', currentTime.toString());
    };
    
    checkMultipleWindows();
  }, []); // 确保每次组件挂载时执行
  
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <Layout className={styles.appLayout}>
      <Header 
        role="student" 
        userName={userInfo.name} 
        collapsed={collapsed} 
        toggleCollapsed={toggleCollapsed} 
        userAvatar={userInfo.avatar}
      >
        <SessionStorageInfo location="header" />
      </Header>
      <Layout>
        <Sidebar 
          role="student" 
          isClubLeader={userInfo.isClubLeader} 
          collapsed={collapsed} 
        />
        <Content className={`${styles.content} ${collapsed ? styles.contentCollapsed : ''}`}>
          <SessionStorageInfo location="content" />
          {showLoginTips && <MultiLoginTips forPage="student" />}
          <div className={styles.contentWrapper}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
} 