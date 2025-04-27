import { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DashboardOutlined, 
  ScheduleOutlined, 
  TrophyOutlined, 
  UserOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Sider, Content } = Layout;

export default function MainLayout({ children }) {
  const [userRole, setUserRole] = useState(1); // 默认学生角色
  const router = useRouter();
  
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setUserRole(userInfo.role || 1);
  }, []);
  
  // 基础菜单项，学生和社长共用
  const baseMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/student">控制台</Link>
    },
    {
      key: 'activities',
      icon: <ScheduleOutlined />,
      label: <Link href="/student/activities">活动列表</Link>
    },
    {
      key: 'myActivities',
      icon: <ScheduleOutlined />,
      label: <Link href="/student/my-activities">我的活动</Link>
    },
    {
      key: 'points',
      icon: <TrophyOutlined />,
      label: <Link href="/student/points">我的积分</Link>
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/student/profile">个人信息</Link>
    }
  ];
  
  // 社长特有菜单项
  const clubManagerItems = [
    {
      key: 'clubManage',
      icon: <TeamOutlined />,
      label: '社团管理',
      children: [
        {
          key: 'clubInfo',
          label: <Link href="/student/club-info">社团信息</Link>
        },
        {
          key: 'members',
          label: <Link href="/student/club-members">成员管理</Link>
        },
        {
          key: 'clubActivities',
          label: <Link href="/student/club-activities">活动管理</Link>
        }
      ]
    }
  ];
  
  // 根据用户角色展示不同菜单
  const menuItems = userRole === 2 
    ? [...baseMenuItems, ...clubManagerItems] 
    : baseMenuItems;
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="light" collapsible>
        <div style={{ height: 64, margin: 16, textAlign: 'center' }}>
          <h2>摇动门</h2>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          style={{ height: '100%' }}
          items={menuItems}
        />
      </Sider>
      <Content style={{ padding: '24px' }}>
        {children}
      </Content>
    </Layout>
  );
} 