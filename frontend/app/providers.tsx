'use client';

import React from 'react';
import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import theme from './theme';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider 
      locale={zhCN}
      theme={theme}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
} 