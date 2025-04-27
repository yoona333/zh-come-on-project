'use client';

import { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, message, Avatar, Row, Col, Spin, Upload, Modal } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, TeamOutlined, CameraOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import type { RcFile } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';

const { TabPane } = Tabs;

interface UserProfile {
  id: number;
  username: string;
  realname: string;
  student_id: string;
  year: string;
  class_name: string;
  email: string;
  phone: string;
  dormitory: string;
  department: string;
  major: string;
  avatar: string;
  bio: string;
  remaining_points: number; // 添加积分字段
}

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8080/api/user/profile', {
        headers: { 'x-access-token': token }
      });

      if (response.data.success) {
        const profileData = response.data.data;
        setProfile(profileData);
        form.setFieldsValue(profileData);

        if (profileData.avatar) {
          setFileList([
            {
              uid: '-1',
              name: 'avatar',
              status: 'done',
              url: profileData.avatar,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('获取用户档案失败:', error);
      message.error('获取个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      return;
    }

    try {
      const response = await axios.put('http://localhost:8080/api/user/profile', values, {
        headers: { 'x-access-token': token }
      });

      if (response.data.success) {
        message.success('个人信息更新成功');
        setProfile(prev => ({...prev!, ...values}));
      } else {
        message.error(response.data.message || '更新失败');
      }
    } catch (error) {
      console.error('更新个人信息失败:', error);
      message.error('更新个人信息失败，请稍后再试');
    }
  };

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('请选择要上传的头像图片');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', fileList[0].originFileObj as RcFile);

    setUploading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/user/avatar', formData, {
        headers: {
          'x-access-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setFileList([
          {
            uid: '-1',
            name: 'avatar',
            status: 'done',
            url: response.data.data.avatar,
          },
        ]);
        message.success('头像上传成功');

        // 更新个人信息中的头像
        setProfile(prev => ({
          ...prev!,
          avatar: response.data.data.avatar
        }));
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      message.error('上传头像失败');
    } finally {
      setUploading(false);
    }
  };

  const updatePassword = async (values: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      return;
    }

    try {
      const response = await axios.put('http://localhost:8080/api/user/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      }, {
        headers: { 'x-access-token': token }
      });

      if (response.data.success) {
        message.success('密码修改成功');
        // 重置密码表单
        form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
      } else {
        message.error(response.data.message || '密码修改失败');
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      message.error(error.response?.data?.message || '修改密码失败，请稍后再试');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Avatar 
                size={120} 
                src={profile?.avatar} 
                icon={<UserOutlined />} 
                style={{ marginBottom: '20px' }}
              />
              <h2>{profile?.realname || profile?.username}</h2>
              <p>{profile?.department} | {profile?.major}</p>
              
              <div style={{ marginTop: '20px' }}>
                <p><MailOutlined style={{ marginRight: 8 }} /> {profile?.email}</p>
                <p><PhoneOutlined style={{ marginRight: 8 }} /> {profile?.phone}</p>
                <p><span style={{ marginRight: 8 }}>积分：</span> {profile?.remaining_points}</p> {/* 添加积分字段 */}
                <p><HomeOutlined style={{ marginRight: 8 }} /> {profile?.dormitory}</p>
                <p><TeamOutlined style={{ marginRight: 8 }} /> {profile?.class_name}</p>
              </div>
            </div>
          </Col>
          
          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="基本信息" key="1">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={profile || {}}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="realname"
                        label="姓名"
                        rules={[{ required: true, message: '请输入姓名' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="student_id"
                        label="学号"
                      >
                        <Input disabled className="read-only-field" style={{ backgroundColor: '#f5f5f5', color: '#666' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="year"
                        label="年级"
                      >
                        <Input disabled className="read-only-field" style={{ backgroundColor: '#f5f5f5', color: '#666' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="class_name"
                        label="班级"
                      >
                        <Input disabled className="read-only-field" style={{ backgroundColor: '#f5f5f5', color: '#666' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="department"
                        label="学院"
                      >
                        <Input disabled className="read-only-field" style={{ backgroundColor: '#f5f5f5', color: '#666' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="major"
                        label="专业"
                      >
                        <Input disabled className="read-only-field" style={{ backgroundColor: '#f5f5f5', color: '#666' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                          { required: true, message: '请输入邮箱' },
                          { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="手机号"
                        rules={[
                          { required: true, message: '请输入手机号' },
                          { pattern: /^1\d{10}$/, message: '请输入有效的手机号' }
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item
                    name="dormitory"
                    label="宿舍地址"
                  >
                    <Input />
                  </Form.Item>
                  
                  <Form.Item
                    name="bio"
                    label="个人简介"
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" size="large" htmlType="submit" style={{ width: '100%' }}>
                      保存修改
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              
              <TabPane tab="修改头像" key="2">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={handlePreview}
                  beforeUpload={(file) => {
                    setFileList([file]);
                    return false;
                  }}
                  onRemove={() => {
                    setFileList([]);
                  }}
                >
                  {fileList.length >= 1 ? null : (
                    <div>
                      <CameraOutlined />
                      <div style={{ marginTop: 8 }}>上传头像</div>
                    </div>
                  )}
                </Upload>
                <Button
                  type="primary"
                  onClick={handleUpload}
                  disabled={fileList.length === 0}
                  loading={uploading}
                  style={{ marginTop: 16 }}
                >
                  {uploading ? '上传中' : '确认上传'}
                </Button>
              </TabPane>
              
              <TabPane tab="账号安全" key="3">
                <Form 
                  layout="vertical"
                  onFinish={updatePassword}
                >
                  <Form.Item
                    label="当前密码"
                    name="currentPassword"
                    rules={[{ required: true, message: '请输入当前密码' }]}
                  >
                    <Input.Password />
                  </Form.Item>
                  
                  <Form.Item
                    label="新密码"
                    name="newPassword"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 6, message: '密码长度不能少于6个字符' }
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  
                  <Form.Item
                    label="确认新密码"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: '请确认新密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的密码不一致'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      修改密码
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Card>
      
      <Modal
        open={previewOpen}
        title="预览头像"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="头像预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
}