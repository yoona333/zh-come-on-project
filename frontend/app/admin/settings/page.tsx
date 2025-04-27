'use client';

import { Card, Form, Input, Button, message, Switch, Select, Space } from 'antd';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// 定义解码后的 JWT 令牌类型
interface DecodedToken {
  exp: number;
  role: number;
  // 可以根据实际情况添加其他字段
}

interface SystemSettings {
  site_name: string;
  site_description: string;
  site_keywords: string;
  site_logo: string;
  site_favicon: string;
  site_copyright: string;
  site_icp: string;
  site_statistics: string;
  email_host: string;
  email_port: number;
  email_username: string;
  email_password: string;
  email_from: string;
  sms_access_key_id: string;
  sms_access_key_secret: string;
  sms_sign_name: string;
  sms_template_code: string;
  upload_max_size: number;
  upload_allowed_types: string;
  upload_path: string;
  activity_approval_required: boolean;
  activity_signup_required: boolean;
  activity_points_enabled: boolean;
  activity_points_ratio: number;
  activity_points_max: number;
  activity_points_min: number;
}

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.exp < Date.now() / 1000) {
        message.error('登录已过期，请重新登录');
        router.push('/login');
        return;
      }

      if (decoded.role !== 0) {
        message.error('您没有管理员权限');
        router.push('/login');
        return;
      }

      fetchSettings(token);
    } catch (error) {
      if (error instanceof Error) {
        console.error('JWT 解码错误:', error.message);
      }
      message.error('无效的登录信息，请重新登录');
      router.push('/login');
    }
  };

  const fetchSettings = async (token: string) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/settings', {
        headers: { 'x-access-token': token }
      });
      form.setFieldsValue(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('获取系统设置失败，HTTP 错误:', error.response?.status, error.message);
      } else {
        console.error('获取系统设置失败，未知错误:', error);
      }
      message.error('获取系统设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: SystemSettings) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        router.push('/login');
        return;
      }
      await axios.put('http://localhost:8080/api/settings', 
        values,
        { headers: { 'x-access-token': token } }
      );
      message.success('系统设置更新成功');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('更新系统设置失败，HTTP 错误:', error.response?.status, error.message);
      } else {
        console.error('更新系统设置失败，未知错误:', error);
      }
      message.error('更新系统设置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title="系统设置" loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Card type="inner" title="网站设置" style={{ marginBottom: 16 }}>
            <Form.Item
              name="site_name"
              label="网站名称"
              rules={[{ required: true, message: '请输入网站名称' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="site_description"
              label="网站描述"
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="site_keywords"
              label="网站关键词"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="site_logo"
              label="网站Logo"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="site_favicon"
              label="网站图标"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="site_copyright"
              label="版权信息"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="site_icp"
              label="备案号"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="site_statistics"
              label="统计代码"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Card>

          <Card type="inner" title="邮件设置" style={{ marginBottom: 16 }}>
            <Form.Item
              name="email_host"
              label="SMTP服务器"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email_port"
              label="SMTP端口"
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="email_username"
              label="SMTP用户名"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email_password"
              label="SMTP密码"
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="email_from"
              label="发件人邮箱"
            >
              <Input />
            </Form.Item>
          </Card>

          <Card type="inner" title="短信设置" style={{ marginBottom: 16 }}>
            <Form.Item
              name="sms_access_key_id"
              label="AccessKey ID"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="sms_access_key_secret"
              label="AccessKey Secret"
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="sms_sign_name"
              label="短信签名"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="sms_template_code"
              label="短信模板"
            >
              <Input />
            </Form.Item>
          </Card>

          <Card type="inner" title="上传设置" style={{ marginBottom: 16 }}>
            <Form.Item
              name="upload_max_size"
              label="最大上传大小(MB)"
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="upload_allowed_types"
              label="允许的文件类型"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="upload_path"
              label="上传路径"
            >
              <Input />
            </Form.Item>
          </Card>

          <Card type="inner" title="活动设置" style={{ marginBottom: 16 }}>
            <Form.Item
              name="activity_approval_required"
              label="活动需要审批"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="activity_signup_required"
              label="活动需要报名"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="activity_points_enabled"
              label="启用积分系统"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="activity_points_ratio"
              label="积分比例"
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="activity_points_max"
              label="最大积分"
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="activity_points_min"
              label="最小积分"
            >
              <Input type="number" />
            </Form.Item>
          </Card>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 