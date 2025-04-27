'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Tooltip, Tag } from 'antd';
import { InfoCircleOutlined, CrownOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface SessionStorageInfoProps {
  location?: 'header' | 'content';
}

export default function SessionStorageInfo({ location = 'content' }: SessionStorageInfoProps) {
  const [isSessionMode, setIsSessionMode] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 检查是否在使用sessionStorage模式
    const isSession = sessionStorage.getItem('auth_mode') === 'session';
    setIsSessionMode(isSession);
    
    if (isSession) {
      const userRole = sessionStorage.getItem('role');
      setRole(userRole);
    }
  }, []);
  
  const handleLogout = () => {
    // 清除会话存储
    sessionStorage.clear();
    
    // 重定向到登录页
    router.push('/login');
  };
  
  // 如果不是会话模式，不显示任何内容
  if (!isSessionMode) {
    return null;
  }
  
  // 根据角色显示不同的标签
  let roleText = '';
  let roleColor = '';
  
  switch (role) {
    case '0':
      roleText = '管理员';
      roleColor = '#f50';
      break;
    case '1':
      roleText = '学生';
      roleColor = '#108ee9';
      break;
    case '2':
      roleText = '社长';
      roleColor = '#87d068';
      break;
    default:
      roleText = '未知角色';
      roleColor = '#999';
  }
  
  // 标题栏模式显示简洁信息
  if (location === 'header') {
    return (
      <Tooltip title="您正在使用社长专用的会话登录模式，关闭标签页后将自动退出登录。适合同时使用多个角色账号。">
        <Button 
          type="link" 
          size="small" 
          icon={<CrownOutlined />}
          style={{ color: roleColor }}
          onClick={handleLogout}
        >
          社长会话 <Tag color={roleColor} style={{ marginLeft: 4 }}>专用模式</Tag>
        </Button>
      </Tooltip>
    );
  }
  
  // 内容区显示更详细的信息
  return (
    <Alert
      message={`社长专用会话模式已启用`}
      description="您正在使用社长专用的会话存储模式，登录信息仅保存在当前标签页。关闭标签页后将自动退出登录，这样您可以同时使用其他账号。"
      type="success"
      showIcon
      icon={<CrownOutlined style={{ color: roleColor }} />}
      closable
      action={
        <Button size="small" danger onClick={handleLogout}>
          退出登录
        </Button>
      }
      style={{ marginBottom: 16 }}
    />
  );
} 