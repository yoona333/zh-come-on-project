"use client";

import React from 'react';
import axios from 'axios';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import styles from '../../src/styles/Login.module.scss';

const { Title } = Typography;

const ForgotPasswordPage = () => {
  const router = useRouter();

  const onFinish = async (values: { username: string; phone: string; email: string }) => {
    try {
      message.loading('重置密码申请中...', 0);
      // 修改请求数据，添加手机号和邮箱
      const response = await axios.post('http://localhost:8080/Forgot/password', {
        username: values.username,
        phone: values.phone,
        email: values.email
      });
      const data = response.data;
      if (data.success) {
        message.success('重置密码申请已提交，请等待处理。');
        router.push('/login');
      } else {
        message.error(data.message || '重置密码申请失败，请稍后重试。');
      }
    } catch (error) {
      message.error('网络错误，请检查网络连接或稍后重试。');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.logoContainer}>
          {/* 修改图片样式类 */}
          <img src="logo.png" alt="攒劲Π" className={`${styles.logo} ${styles.logoWithShadow}`} />
          <Title level={2} className={styles.title}>攒劲Π校内活动积分系统 - 忘记密码</Title>
        </div>

        <Card className={styles.loginCard}>
          <Form
            name="forgotPassword"
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
            {/* 添加手机号输入框 */}
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入手机号!' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号!' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="手机号" />
            </Form.Item>
            {/* 添加邮箱输入框 */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '请输入有效的邮箱!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="邮箱" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                提交申请
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;