'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Radio, Typography, Spin } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../../styles/Login.module.scss';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 模拟页面加载
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          role: role
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        message.success('登录成功！');
        
        // 根据角色跳转到不同的首页
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/student');
        }
      } else {
        message.error(data.message || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      console.error('登录错误:', error);
      message.error('登录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginWrapper}>
        <div className={styles.loginLeft}>
          <div className={styles.logoContainer}>
            <Image 
              src="/images/logo.png" 
              alt="攒劲Π" 
              width={120} 
              height={120} 
              className={styles.logo}
            />
            <Title level={2} className={styles.systemTitle}>攒劲Π校内活动积分系统</Title>
            <Text className={styles.systemSlogan}>记录每一次活动，累积每一分成长</Text>
          </div>
        </div>
        
        <Card className={styles.loginCard} bordered={false}>
          <Title level={3} className={styles.loginTitle}>用户登录</Title>
          
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            className={styles.loginForm}
          >
            <Form.Item className={styles.roleSelector}>
              <Radio.Group 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                buttonStyle="solid"
                className={styles.roleButtons}
              >
                <Radio.Button value="student">学生登录</Radio.Button>
                <Radio.Button value="admin">管理员登录</Radio.Button>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input 
                prefix={<UserOutlined className={styles.inputIcon} />} 
                placeholder={role === 'student' ? "学号" : "管理员账号"} 
                className={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.inputIcon} />}
                placeholder="密码"
                className={styles.input}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                icon={<LoginOutlined />}
                className={styles.loginButton}
              >
                登录
              </Button>
            </Form.Item>
            
            {role === 'student' && (
              <div className={styles.loginFooter}>
                <a href="/forgot-password">忘记密码?</a>
              </div>
            )}
          </Form>
        </Card>
      </div>
      
      <div className={styles.loginFooterText}>
        <Text type="secondary">© {new Date().getFullYear()} 攒劲Π校内活动积分系统 版权所有</Text>
      </div>
    </div>
  );
} 