'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, IdcardOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../styles/ForgotPassword.module.scss';

const { Title } = Typography;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 这里应该调用API提交忘记密码请求
      // 模拟提交成功
      setTimeout(() => {
        message.success('密码找回请求已提交，请等待管理员处理');
        router.push('/');
      }, 1000);
    } catch (error) {
      message.error('提交失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title level={2} className={styles.title}>找回密码</Title>
        <Form
          name="forgot_password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="studentId"
            label="学号"
            rules={[{ required: true, message: '请输入学号!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入学号" />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
          </Form.Item>
          
          <Form.Item
            name="idCardLast6"
            label="身份证后六位"
            rules={[
              { required: true, message: '请输入身份证后六位!' },
              { len: 6, message: '请输入正确的身份证后六位!' }
            ]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="请输入身份证后六位" />
          </Form.Item>
          
          <Form.Item
            name="contactInfo"
            label="联系方式"
            rules={[{ required: true, message: '请输入联系方式!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入手机号或邮箱" />
          </Form.Item>
          
          <Form.Item
            name="reason"
            label="申请原因"
            rules={[{ required: true, message: '请简述申请原因!' }]}
          >
            <Input.TextArea rows={4} placeholder="请简述申请原因" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              提交申请
            </Button>
          </Form.Item>
          
          <Form.Item>
            <Link href="/">
              <Button type="link" block>返回登录</Button>
            </Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 