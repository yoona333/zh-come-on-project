'use client';

import { useState } from 'react';
import { Layout } from 'antd';
import Header from '../../src/components/ui/Header';
import Sidebar from '../../src/components/ui/Sidebar';
import styles from '../../src/styles/Layout.module.scss';

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
    <Layout className={styles.appLayout}>
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
        <Content className={`${styles.content} ${collapsed ? styles.contentCollapsed : ''}`}>
          <div className={styles.contentWrapper}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
} 