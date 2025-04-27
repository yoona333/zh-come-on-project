'use client';

import { useState, useEffect } from 'react';
import { Layout, Button, Dropdown, Avatar, Badge, Typography, Breadcrumb, Space } from 'antd';
import type { MenuProps } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined, 
  BellOutlined, 
  LogoutOutlined,
  SettingOutlined,
  DownOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from '../../styles/Header.module.scss';
import axios from 'axios'; // 引入 axios 用于发送请求

const { Header } = Layout;
const { Text } = Typography;

// 默认头像
const defaultAvatar = '/uploads/avatars/default_2.png';

interface HeaderProps {
  role: 'admin' | 'student';
  userName: string;
  userAvatar?: string;
  collapsed: boolean;
  toggleCollapsed: () => void;
  children?: React.ReactNode;
}

const HeaderComponent: React.FC<HeaderProps> = ({ 
  role, 
  userName, 
  userAvatar, 
  collapsed, 
  toggleCollapsed,
  children 
}) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const response = await axios.get('http://localhost:8080/api/reservations/unread-count', {
        headers: {
          'x-access-token': token
        },
        params: {
          currentTime: currentTime
        }
      });
      setUnreadCount(response.data.data.unread_count); 
      // 添加打印语句
      console.log('获取到的未读通知数量:', response.data.data.unread_count); 
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchUnreadCount();
  }, [pathname]); // 监听 pathname 变化，当路由切换时重新获取未读通知数量

  const handleLogout = () => {
    // 清除localStorage中的登录信息
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    
    // 清除sessionStorage中的登录信息
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('auth_mode');
    
    // 重定向到登录页
    router.push('/login');
  };

  // 修改铃铛图标点击事件
  const handleBellClick = () => {
    router.push(`/${role}/notifications`);
  };

  // 构建面包屑
  const getBreadcrumbItems = () => {
    if (!pathname) return [{ title: '首页' }];
    
    const pathParts = pathname.split('/').filter(Boolean);
    const items = [{ title: <Link href="/">首页</Link> }];
    
    let accumulated = '';
    pathParts.forEach((part, index) => {
      accumulated += `/${part}`;
      const title = part.charAt(0).toUpperCase() + part.slice(1);
      
      if (index === pathParts.length - 1) {
        items.push({ title });
      } else {
        items.push({ title: <Link href={accumulated}>{title}</Link> });
      }
    });
    
    return items;
  };
  
  const breadcrumbItems = getBreadcrumbItems();

  // 用户菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href={`/${role}/profile`}>个人信息</Link>,
    },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: <Link href={`/${role}/settings`}>设置</Link>,
    // },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <a onClick={handleLogout}>退出登录</a>,
    },
  ];

  // 通知菜单项
  const notificationMenuItems: MenuProps['items'] = [
    {
      key: 'notification-1',
      label: (
        <div>
          <Text strong>系统通知</Text>
          <p>您有一个新的活动需要参加</p>
        </div>
      ),
    },
    {
      key: 'notification-2',
      label: (
        <div>
          <Text strong>活动提醒</Text>
          <p>明天下午有社团活动</p>
        </div>
      ),
    },
    {
      key: 'notification-all',
      label: <Link href={`/${role}/notifications`}>查看全部通知</Link>,
    },
  ];

  return (
    <Header className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          className={styles.trigger}
        />
        <div className={styles.breadcrumb}>
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>
      <div className={styles.headerRight}>
        {/* 额外的内容插槽 */}
        {children}
        
        <Space>
          {unreadCount > 0 ? (
            <Badge count={unreadCount}>
              <Button 
                type="text" 
                shape="circle" 
                icon={<BellOutlined />} 
                // 修改点击事件
                onClick={handleBellClick} 
              />
            </Badge>
          ) : (
            <Button 
              type="text" 
              shape="circle" 
              icon={<BellOutlined />} 
              onClick={handleBellClick} 
            />
          )}
          
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className={styles.userInfo}>
              <Avatar src={userAvatar || defaultAvatar} size="small" />
              <span>{userName}</span>
              <DownOutlined style={{ fontSize: '12px' }} />
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default HeaderComponent;