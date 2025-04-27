'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin, message } from 'antd';

export default function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const handleRedirect = () => {
      try {
        // 获取URL参数中的登录数据
        const dataParam = searchParams.get('data');
        if (!dataParam) {
          message.error('登录数据缺失，请重新登录');
          router.push('/login');
          return;
        }
        
        // 解析登录数据
        const loginData = JSON.parse(decodeURIComponent(dataParam));
        
        // 如果是学生账号，使用localStorage
        // 为学生账号使用localStorage以便在隐身窗口中长期保持登录状态
        if (loginData.username) {
          // 在隐身窗口使用标准登录
          localStorage.setItem('username', loginData.username);
          
          // 重定向到登录页面
          setTimeout(() => {
            message.info('请在此隐身窗口中重新登录您的学生账号', 2);
            router.push('/login');
          }, 1500);
          return;
        }
        
        // 获取完整登录数据并重定向
        const token = loginData.token;
        const role = loginData.role;
        
        if (!token || !role) {
          message.error('登录数据不完整，请重新登录');
          router.push('/login');
          return;
        }
        
        // 将登录数据保存到localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        if (loginData.username) {
          localStorage.setItem('username', loginData.username);
        }
        if (loginData.userId) {
          localStorage.setItem('userId', loginData.userId);
        }
        
        // 根据角色重定向
        const roleNum = parseInt(role);
        switch (roleNum) {
          case 0: // 管理员
            router.push('/admin');
            break;
          case 1: // 学生
            router.push('/student');
            break;
          case 2: // 社长
            router.push('/student/activity-stats');
            break;
          default:
            router.push('/student');
        }
      } catch (error) {
        console.error('处理登录重定向失败:', error);
        message.error('登录数据无效，请重新登录');
        router.push('/login');
      }
    };
    
    // 使用setTimeout确保localStorage操作在客户端执行
    setTimeout(() => {
      handleRedirect();
      setLoading(false);
    }, 500);
  }, [router, searchParams]);
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f0f2f5'
    }}>
      <Spin size="large" tip="正在准备隐身窗口登录环境..." />
      <p style={{ marginTop: '20px' }}>请不要关闭当前窗口，系统正在处理登录信息...</p>
    </div>
  );
} 