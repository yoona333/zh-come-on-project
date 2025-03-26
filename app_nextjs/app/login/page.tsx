"use client";

// login.tsx
import React, { useState } from 'react'; // 导入React和useState钩子
import axios from 'axios'; // 导入axios用于发送HTTP请求
import "../css/login.css";
import { Card, Form, Input, Button, Checkbox, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../src/styles/Login.module.scss';
// import Home from '../homedaohan/page'; // 引入Sidebar组件

const { Title } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 实际的登录API调用
      const response = await axios.post('http://localhost:3001/login', values);
      const data = response.data;
      setLoading(false);
      if (data.success) {
        message.success('登录成功！');
        if (data.role === 0) {
          router.push('/admin');
        } else {
          router.push('/student');
        }
      } else {
        message.error(data.message || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      setLoading(false);
      message.error('登录失败，请检查网络或稍后重试');
    }
  };

  const handleForgotPassword = () => {
    // 使用 router.push 直接跳转到忘记密码页面
    // message.info('忘记密码功能正在开发中...');
    router.push('/ForgotPassword'); 
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.logoContainer}>
          <img src="/images/logo.png" alt="攒劲Π" className={styles.logo} />
          <Title level={2} className={styles.title}>攒劲Π校内活动积分系统</Title>
        </div>
        
        <Card className={styles.loginCard}>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>

              <Link 
                href="/forgot-password" 
                className={styles.forgotPassword}
                onClick={(e) => {
                  e.preventDefault();
                  handleForgotPassword();
                }}
              >
                忘记密码
              </Link>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;