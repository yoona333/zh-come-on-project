'use client';

import { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Layout as AntLayout } from 'antd';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from '../../styles/Layout.module.scss';

const { Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
  role?: 'student' | 'admin';
  userName?: string;
}

export default function Layout({ children, role = 'admin', userName = '用户' }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <AntLayout className={styles.layout}>
      <Sidebar collapsed={collapsed} />
      <AntLayout className={collapsed ? styles.contentCollapsed : ''}>
        <Header 
          role={role} 
          userName={userName} 
          collapsed={collapsed} 
          toggleCollapsed={toggleCollapsed} 
        />
        <Content className={styles.content}>
          <div className={styles.contentWrapper}>
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
} 