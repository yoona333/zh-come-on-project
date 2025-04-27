import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './style.css';
import { AntdProvider } from './providers';
import FloatingAIButton from '@/components/FloatingAIButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '攒劲Π校内活动积分系统',
  description: '校内社团活动管理与积分系统',
  icons: {
    icon: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" key="favicon" />
      </head>
      <body className={inter.className}>
        <AntdProvider>
          {children}
          <FloatingAIButton />
        </AntdProvider>
      </body>
    </html>
  );
}
