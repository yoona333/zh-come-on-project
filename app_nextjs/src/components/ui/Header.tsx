'use client';

import { useState, useEffect } from 'react';
import { Layout, Button, Dropdown, Avatar, Badge, Typography, message } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  UserOutlined, 
  BellOutlined, 
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../../styles/Header.module.scss';

const { Header } = Layout;
const { Text } = Typography;

interface HeaderProps {
  role: 'student' | 'admin';
  userName: string;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export default function AppHeader({ role, userName, collapsed, toggleCollapsed }: HeaderProps) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // 模拟获取通知
  useEffect(() => {
    // 这里应该从API获取通知数据
    setNotifications([
      { id: 1, title: '新活动发布：校园歌唱比赛', read: false },
      { id: 2, title: '您的活动申请已通过', read: false },
      { id: 3, title: '您获得了5积分奖励', read: true },
    ]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // 链接样式
  const linkStyle = { display: 'block', width: '100%', height: '100%', padding: '0 8px' };

  // 退出登录处理函数
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        message.success('退出登录成功');
        // 重定向到登录页面
        window.location.href = '/login';
      } else {
        message.error(data.message || '退出登录失败');
      }
    } catch (error) {
      console.error('退出登录错误:', error);
      message.error('退出登录失败，请稍后再试');
    }
  };

  // 通知菜单
  const notificationMenu = {
    items: notifications.map(notification => ({
      key: notification.id.toString(),
      label: (
        <div className={styles.notificationItem}>
          <Text strong={!notification.read}>{notification.title}</Text>
          {!notification.read && <Badge status="processing" />}
        </div>
      ),
    })),
    footer: {
      label: <Link href={`/${role}/notifications`} style={linkStyle}>查看全部通知</Link>,
    },
  };

  // 用户菜单
  const userMenu = {
    items: [
      {
        key: '1',
        icon: <UserOutlined />,
        label: <Link href={`/${role}/profile`} style={linkStyle}>个人信息</Link>,
      },
      {
        key: '2',
        icon: <SettingOutlined />,
        label: <Link href={`/${role}/settings`} style={linkStyle}>设置</Link>,
      },
      {
        type: 'divider' as const,
        key: 'divider-1',
      },
      {
        key: '3',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Header className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          className={styles.trigger}
        />
        <div className={styles.logo}>
          <Link href={`/${role}`}>
            <img src="/images/logo.png" alt="攒劲Π" height={32} />
            <span className={styles.logoText}>攒劲Π</span>
          </Link>
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <Dropdown menu={notificationMenu} placement="bottomRight" arrow>
          <Badge count={unreadCount} className={styles.notificationBadge}>
            <Button type="text" icon={<BellOutlined />} className={styles.iconButton} />
          </Badge>
        </Dropdown>
        
        <Dropdown menu={userMenu} placement="bottomRight" arrow>
          <div className={styles.userInfo}>
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
            <span className={styles.userName}>{userName}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
} 