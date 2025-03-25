'use client';

import { useState } from 'react';
import { Layout } from 'antd';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import styles from '../../styles/Layout.module.scss';

const { Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  
  // 这里应该从API或状态管理中获取管理员信息
  const adminInfo = {
    name: '管理员',
  };
  
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <Layout className={styles.layout}>
      <Header 
        role="admin" 
        userName={adminInfo.name} 
        collapsed={collapsed} 
        toggleCollapsed={toggleCollapsed} 
      />
      <Layout>
        <Sidebar 
          role="admin" 
          collapsed={collapsed} 
        />
        <Content className={styles.content}>
          <div className={styles.contentWrapper}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
} 