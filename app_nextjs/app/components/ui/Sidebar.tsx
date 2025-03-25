'use client';

import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  TrophyOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  BarChartOutlined,
  KeyOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Sider } = Layout;

interface SidebarProps {
  role: 'student' | 'admin';
  isClubLeader?: boolean;
  collapsed: boolean;
}

export default function Sidebar({ role, isClubLeader = false, collapsed }: SidebarProps) {
  const pathname = usePathname();
  
  const studentMenuItems = [
    {
      key: '/student',
      icon: <DashboardOutlined />,
      label: <Link href="/student">仪表盘</Link>,
    },
    {
      key: '/student/activities',
      icon: <CalendarOutlined />,
      label: <Link href="/student/activities">活动列表</Link>,
    },
    {
      key: '/student/my-activities',
      icon: <FileTextOutlined />,
      label: <Link href="/student/my-activities">我的活动</Link>,
    },
    {
      key: '/student/points',
      icon: <TrophyOutlined />,
      label: <Link href="/student/points">我的积分</Link>,
    },
    {
      key: '/student/profile',
      icon: <UserOutlined />,
      label: <Link href="/student/profile">个人信息</Link>,
    }
  ];
  
  // 社长特有菜单项
  const clubLeaderMenuItems = isClubLeader ? [
    {
      key: 'club-leader',
      icon: <TeamOutlined />,
      label: '社长功能',
      children: [
        {
          key: '/student/create-activity',
          icon: <PlusCircleOutlined />,
          label: <Link href="/student/create-activity">创建活动</Link>,
        },
        {
          key: '/student/club-members',
          icon: <TeamOutlined />,
          label: <Link href="/student/club-members">社团成员</Link>,
        },
        {
          key: '/student/activity-stats',
          icon: <BarChartOutlined />,
          label: <Link href="/student/activity-stats">活动统计</Link>,
        },
      ],
    }
  ] : [];
  
  const adminMenuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/admin">仪表盘</Link>,
    },
    {
      key: '/admin/manage-students',
      icon: <UserOutlined />,
      label: <Link href="/admin/manage-students">学生管理</Link>,
    },
    {
      key: '/admin/manage-activities',
      icon: <CalendarOutlined />,
      label: <Link href="/admin/manage-activities">活动管理</Link>,
    },
    {
      key: '/admin/manage-clubs',
      icon: <TeamOutlined />,
      label: <Link href="/admin/manage-clubs">社团管理</Link>,
    },
    {
      key: '/admin/password-requests',
      icon: <KeyOutlined />,
      label: <Link href="/admin/password-requests">密码请求</Link>,
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: <Link href="/admin/settings">系统设置</Link>,
    },
  ];
  
  const menuItems = role === 'student' 
    ? [...studentMenuItems, ...clubLeaderMenuItems]
    : adminMenuItems;
  
  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      className="sidebar"
      width={220}
    >
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        className="side-menu"
      />
    </Sider>
  );
} 