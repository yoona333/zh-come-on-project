'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Tabs, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../styles/Login.module.scss';

const { Title } = Typography;
const { TabPane } = Tabs;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStudentLogin = async (values: any) => {
    setLoading(true);
    try {
      // 这里应该调用API进行登录验证
      // 模拟登录成功
      setTimeout(() => {
        message.success('登录成功！');
        router.push('/student');
      }, 1000);
    } catch (error) {
      message.error('登录失败，请检查学号和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (values: any) => {
    setLoading(true);
    try {
      // 这里应该调用API进行管理员登录验证
      // 模拟登录成功
      setTimeout(() => {
        message.success('管理员登录成功！');
        router.push('/admin');
      }, 1000);
    } catch (error) {
      message.error('登录失败，请检查账号和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.logoContainer}>
          <img src="/images/logo.png" alt="攒劲Π" className={styles.logo} />
          <Title level={2} className={styles.title}>攒劲Π校内活动积分系统</Title>
        </div>
        
        <Card className={styles.loginCard}>
          <Tabs defaultActiveKey="student">
            <TabPane tab="学生登录" key="student">
              <Form
                name="student_login"
                initialValues={{ remember: true }}
                onFinish={handleStudentLogin}
                size="large"
              >
                <Form.Item
                  name="studentId"
                  rules={[{ required: true, message: '请输入学号!' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="学号" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入身份证后六位!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="身份证后六位"
                  />
                </Form.Item>
                <Form.Item>
                  <Link href="/forgot-password">
                    忘记密码？
                  </Link>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            <TabPane tab="管理员登录" key="admin">
              <Form
                name="admin_login"
                initialValues={{ remember: true }}
                onFinish={handleAdminLogin}
                size="large"
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入管理员账号!' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="管理员账号" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    管理员登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
} 