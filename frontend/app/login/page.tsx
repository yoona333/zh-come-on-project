"use client";

// login.tsx
import React, { useState } from 'react'; // 导入React和useState钩子
import axios from 'axios'; // 导入axios用于发送HTTP请求
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import styles from './login.module.css'; // 使用独立的CSS文件，避免模块加载问题

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 实际的登录API调用
      const response = await axios.post('http://localhost:8080/login', values);
      const data = response.data;
      setLoading(false);
      if (data.success) {
        // 存储token到localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        // 存储role到localStorage
        if (data.role !== undefined) {
          localStorage.setItem('role', data.role.toString());
        }
        // 存储用户名和用户ID
        if (data.username) {
          localStorage.setItem('username', data.username);
        }
        if (data.userId) {
          localStorage.setItem('userId', data.userId.toString());
        }
        message.success('登录成功！');
        
        // 根据角色重定向
        switch(parseInt(data.role)) {
          case 0: // 管理员
            router.push('/admin');
            break;
          case 1: // 学生
            router.push('/student');
            break;
          case 2: // 社长
            router.push('/student/activity-stats'); // 社长专用页面
            break;
          default:
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
    router.push('/ForgotPassword');
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        {/* 左侧 - 图片区域 */}
        <div className={styles.leftSection}>
          <div className={styles.logoArea}>
            <img src="/logo.png" alt="攒劲Π" className={styles.logo} />
            <h2 className={styles.systemName}>攒劲Π校内活动积分系统</h2>
          </div>
          <div className={styles.imageContainer}>
            <img 
              src="/images/tupian.jpeg" 
              alt="系统展示" 
              className={styles.illustration}
            />
          </div>
        </div>
        
        {/* 右侧 - 登录表单 */}
        <div className={styles.rightSection}>
          <h1 className={styles.loginTitle}>用户登录</h1>
          <Form
            name="login"
            className={styles.loginForm}
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入账号"
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                size="large"
              />
            </Form.Item>
            
            <div className={styles.optionsRow}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a className={styles.forgotLink} onClick={handleForgotPassword}>
                忘记密码?
              </a>
            </div>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.loginButton}
                loading={loading}
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          
          <div className={styles.tips}>
            温馨提示：欢迎使用攒劲Π校内活动积分系统，参与活动赚取积分！
            <br />
            如遇登录问题，请联系系统管理员张老师: 18870064525
          </div>
          
          
          <div className={styles.copyright}>
            Copyright © {new Date().getFullYear()} 攒劲Π校内活动积分系统
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;