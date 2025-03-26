'use client';

import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  TrophyOutlined,
  UserOutlined,
  CrownOutlined,
  TeamOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../../styles/Sidebar.module.scss';

const { Sider } = Layout;

interface SidebarProps {
  role: 'student' | 'admin';
  collapsed: boolean;
}

export default function Sidebar({ role, collapsed }: SidebarProps) {
  const pathname = usePathname();
  
  // 获取当前选中的菜单项
  const selectedKey = pathname.split('/')[2] || 'dashboard';
  
  // 创建菜单项
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href={`/${role}`}>首页</Link>,
    },
    {
      key: 'activities',
      icon: <AppstoreOutlined />,
      label: <Link href={`/${role}/activities`}>活动列表</Link>,
    },
    {
      key: 'my-activities',
      icon: <CalendarOutlined />,
      label: <Link href={`/${role}/my-activities`}>我的活动</Link>,
    },
    {
      key: 'points',
      icon: <TrophyOutlined />,
      label: <Link href={`/${role}/points`}>我的积分</Link>,
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href={`/${role}/profile`}>个人信息</Link>,
    },
  ];
  
  // 如果是管理员，添加社长功能
  if (role === 'admin') {
    menuItems.push({
      key: 'club-management',
      icon: <CrownOutlined />,
      label: '社长功能',
      children: [
        {
          key: 'create-activity',
          label: <Link href={`/${role}/create-activity`}>创建活动</Link>,
        },
        {
          key: 'manage-members',
          label: <Link href={`/${role}/manage-members`}>管理成员</Link>,
        },
        {
          key: 'activity-stats',
          label: <Link href={`/${role}/activity-stats`}>活动统计</Link>,
        },
        // 新增修改密码子菜单
        {
          key: 'change-password',
          label: <Link href={`/${role}/change-password`}>修改密码</Link>,
        },
      ],
    });
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className={styles.sidebar}
      width={220}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={['club-management']}
        items={menuItems}
        className={styles.sideMenu}
        style={{ height: '100%', borderRight: 0 }}
      />
    </Sider>
  );
} 