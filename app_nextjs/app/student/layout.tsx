'use client';

import { useState } from 'react';
import { Layout } from 'antd';
import Header from '../../src/components/ui/Header';
import Sidebar from '../../src/components/ui/Sidebar';
import styles from '../../src/styles/Layout.module.scss';

const { Content } = Layout;

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  
  // 这里应该从API或状态管理中获取用户信息
  const userInfo = {
    name: '张三',
    isClubLeader: true,
  };
  
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
      />
      <Layout>
        <Sidebar 
          role="student" 
          isClubLeader={userInfo.isClubLeader} 
          collapsed={collapsed} 
        />
        <Content className={`${styles.content} ${collapsed ? styles.contentCollapsed : ''}`}>
          <div className={styles.contentWrapper}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
} 