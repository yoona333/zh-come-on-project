// page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Tag, Button, Modal, Form, Input, Space, Card, App, Avatar, Popconfirm, DatePicker, Tooltip, Alert, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import axios from 'axios';

// const { Option } = Select;

interface CustomJwtPayload {
  exp?: number;
  role: number;
  userId: number;
}

interface UserInfo {
  id: number;
  username: string;
  role: number;
  email: string;
  phone: string;
  department: string;
  major: string;
  grade: string;
  class: string;
  address: string;
  bio: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

const ClubMembersPage: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [form] = Form.useForm();
  const { message: messageApi, notification } = App.useApp();

  useEffect(() => {
    checkAuth();
  }, [router]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      messageApi.error('请先登录');
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<CustomJwtPayload>(token);
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        messageApi.error('登录已过期，请重新登录');
        router.push('/login');
        return;
      }

      // 只有管理员可以访问
      if (decoded.role !== 0) {
        messageApi.error('您没有管理员权限');
        router.push('/login');
        return;
      }

      fetchUsers(token);
    } catch (error) {
      messageApi.error('无效的登录信息，请重新登录');
      router.push('/login');
    }
  };

  const fetchUsers = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'x-access-token': token
        },
      });

      if (!response.ok) {
        throw new Error('获取用户列表失败');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        console.error('数据格式错误:', data);
        notification.error({
          message: '获取用户列表失败',
          description: '数据格式不符合预期',
          duration: 4
        });
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      notification.error({
        message: '获取用户列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        duration: 4
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      messageApi.loading('正在删除用户...');

      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '删除用户失败');
      }

      messageApi.success('用户已删除');
      fetchUsers(token);
    } catch (error) {
      console.error('删除用户失败:', error);
      notification.error({
        message: '删除用户失败',
        description: error instanceof Error ? error.message : '未知错误',
        duration: 4
      });
    }
  };

  const showModal = (user?: UserInfo) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue({
        ...user,
        created_at: dayjs(user.created_at),
        updated_at: dayjs(user.updated_at)
      });
    } else {
      setEditingUser(null);
      form.resetFields();
      form.setFieldsValue({
        created_at: dayjs(),
        updated_at: dayjs()
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const userData = {
        username: values.username,
        email: values.email,
        phone: values.phone,
        department: values.department,
        major: values.major,
        grade: values.grade,
        class: values.class,
        address: values.address,
        bio: values.bio,
        avatar: values.avatar,
        created_at: values.created_at.format('YYYY-MM-DD'),
        updated_at: values.updated_at.format('YYYY-MM-DD')
      };

      if (editingUser) {
        const response = await fetch(`http://localhost:8080/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'x-access-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '更新用户信息失败');
        }

        messageApi.success('用户信息更新成功');
      } else {
        const response = await fetch(`http://localhost:8080/api/users`, {
          method: 'POST',
          headers: {
            'x-access-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '添加用户失败');
        }

        messageApi.success('用户添加成功');
      }

      setIsModalVisible(false);
      fetchUsers(token);
    } catch (error) {
      console.error('保存用户信息失败:', error);
      notification.error({
        message: '保存用户信息失败',
        description: error instanceof Error ? error.message : '未知错误',
        duration: 4
      });
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          {text}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '专业',
      dataIndex: 'major',
      key: 'major',
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: '班级',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '简介',
      dataIndex: 'bio',
      key: 'bio',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: UserInfo) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Spin spinning={loading}>
        <Card 
          title="用户管理"
          bordered={false}
          style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showModal()}
              style={{ borderRadius: '4px', fontWeight: 500 }}
            >
              添加用户
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 个用户`
            }}
            rowClassName={() => 'member-table-row'}
            className="custom-table"
            scroll={{ x: 1200 }}
            locale={{
              emptyText: '暂无用户'
            }}
          />
        </Card>
      </Spin>

      {/* 用户创建/编辑表单 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {editingUser ? (
              <EditOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            ) : (
              <PlusOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            )}
            <span>{editingUser ? '编辑用户' : '添加用户'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入电话' }]}
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="department"
            label="部门"
            rules={[{ required: true, message: '请输入部门' }]}
          >
            <Input placeholder="请输入部门" />
          </Form.Item>
          <Form.Item
            name="major"
            label="专业"
            rules={[{ required: true, message: '请输入专业' }]}
          >
            <Input placeholder="请输入专业" />
          </Form.Item>
          <Form.Item
            name="grade"
            label="年级"
            rules={[{ required: true, message: '请输入年级' }]}
          >
            <Input placeholder="请输入年级" />
          </Form.Item>
          <Form.Item
            name="class"
            label="班级"
            rules={[{ required: true, message: '请输入班级' }]}
          >
            <Input placeholder="请输入班级" />
          </Form.Item>
          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item
            name="bio"
            label="简介"
            rules={[{ required: true, message: '请输入简介' }]}
          >
            <Input placeholder="请输入简介" />
          </Form.Item>
          <Form.Item
            name="avatar"
            label="头像"
          >
            <Input placeholder="请输入头像链接" />
          </Form.Item>
          <Form.Item
            name="created_at"
            label="创建时间"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="updated_at"
            label="更新时间"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button onClick={handleCancel}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '添加'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClubMembersPage;