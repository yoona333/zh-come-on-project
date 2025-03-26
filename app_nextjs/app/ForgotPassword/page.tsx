"use client";

import React from 'react';
import axios from 'axios';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import styles from '../../src/styles/Login.module.scss';

const { Title } = Typography;

const ForgotPasswordPage = () => {
  const router = useRouter();

  const onFinish = async (values: { username: string }) => {
    try {
      message.loading('重置密码申请中...', 0);
      const response = await axios.post('http://localhost:3001/Forgot/password', { username: values.username });
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
          <img src="/images/logo.png" alt="攒劲Π" className={styles.logo} />
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