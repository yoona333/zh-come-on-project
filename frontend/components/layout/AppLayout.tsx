import { useState, useEffect } from 'react';
import { Layout, Menu, message } from 'antd';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const { Sider, Content } = Layout;

// 不同角色的路由前缀和菜单配置
const roleConfig = {
  1: { // 学生
    pathPrefix: '/student',
    redirectPath: '/student',
    menu: [ /* 学生菜单项 */ ]
  },
  2: { // 社长
    pathPrefix: '/club',
    redirectPath: '/club',
    menu: [ /* 社长菜单项 */ ]
  },
  3: { // 管理员
    pathPrefix: '/admin',
    redirectPath: '/admin',
    menu: [ /* 管理员菜单项 */ ]
  }
};

export default function AppLayout({ children }) {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    checkUserAccess();
  }, []);
  
  const checkUserAccess = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      const response = await axios.get('http://localhost:8080/api/user/profile', {
        headers: { 'x-access-token': token }
      });
      
      if (response.data.success) {
        const user = response.data.data;
        setUserRole(user.role);
        
        // 检查当前URL是否匹配用户角色
        const currentPath = window.location.pathname;
        const config = roleConfig[user.role];
        
        if (!currentPath.startsWith(config.pathPrefix)) {
          message.error('您没有权限访问此页面');
          router.push(config.redirectPath);
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      router.push('/login');
    }
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {userRole && (
        <Sider>
          <Menu 
            theme="dark" 
            mode="inline"
            items={roleConfig[userRole].menu}
          />
        </Sider>
      )}
      <Content>
        {children}
      </Content>
    </Layout>
  );
} 