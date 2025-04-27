'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Table, Tag, Button, Modal, Form, Input, Select, Space, Card, App, Avatar, Popconfirm, DatePicker, Tooltip, Alert, Spin, Result } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UserOutlined, ArrowLeftOutlined, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import axios from 'axios';

const { Option } = Select;

interface CustomJwtPayload {
  exp?: number;
  role: number;
  userId: number;
}

interface ClubMember {
  id: number;
  user_id: number;
  club_id: number;
  role: number;
  join_date: string;
  username: string;
  email: string;
  status: number;
  club_name?: string;
}

interface Club {
  id: number;
  name: string;
  description: string;
  logo?: string;
  status: number;
  created_at: string;
  leader_id: number;
  leader_name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: number;
}

const ClubMembersPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clubId = searchParams.get('clubId');
  
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<ClubMember | null>(null);
  const [form] = Form.useForm();
  const { message: messageApi, notification } = App.useApp();
  const [loadingClub, setLoadingClub] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [filterClubId, setFilterClubId] = useState<number | null>(clubId ? Number(clubId) : null);

  useEffect(() => {
    console.log("社团ID:", clubId); // 调试日志
    
    if (clubId) {
      setFilterClubId(Number(clubId));
    }
    
    checkAuth();
  }, [clubId, router]);

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

      // 加载所有社团和成员
      fetchClubs(token);
      fetchAllMembers(token);
      fetchUsers(token);
      
      // 如果有指定社团ID，再获取该社团的详细信息
      if (clubId) {
        fetchClub(token);
      } else {
        setLoadingClub(false);
      }
    } catch (error) {
      messageApi.error('无效的登录信息，请重新登录');
      router.push('/login');
    }
  };

  const fetchClubs = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/clubs', {
        headers: {
          'x-access-token': token
        },
      });

      if (!response.ok) {
        throw new Error('获取社团列表失败');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setClubs(data.data);
      }
    } catch (error) {
      console.error('获取社团列表失败:', error);
      notification.error({
        message: '获取社团列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        duration: 4
      });
    }
  };

  const fetchAllMembers = async (token: string) => {
    setLoading(true);
    try {
      // 获取所有社团的成员
      const url = `http://localhost:8080/api/club-members`;
      console.log("请求所有社团成员的URL:", url);

      const response = await fetch(url, {
        headers: {
          'x-access-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error(`获取社团成员列表失败，状态码: ${response.status}`);
      }

      const data = await response.json();
      console.log("所有社团成员数据:", data);
      
      if (data.success && Array.isArray(data.data)) {
        setMembers(data.data);
      } else {
        console.error('数据格式错误:', data);
        notification.error({
          message: '获取社团成员列表失败',
          description: '数据格式不符合预期',
          duration: 4
        });
      }
    } catch (err) {
      console.error('获取社团成员列表失败:', err);
      notification.error({
        message: '获取社团成员列表失败',
        description: err instanceof Error ? err.message : '未知错误',
        duration: 4
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClub = async (token: string) => {
    setLoadingClub(true);
    setError(null);
    try {
      console.log("尝试获取社团信息，社团ID:", clubId);
      
      // 主API路径
      let url = `http://localhost:8080/api/clubs/${clubId}`;
      console.log("请求社团信息URL:", url);
      
      let response = await fetch(url, {
        headers: {
          'x-access-token': token
        }
      });

      // 如果主要API路径失败，尝试备用路径
      if (!response.ok) {
        console.log("主API请求失败，尝试备用API");
        
        // 备用API路径
        const backupUrl = `http://localhost:8080/api/clubs?id=${clubId}`;
        console.log("尝试备用URL:", backupUrl);
        
        response = await fetch(backupUrl, {
          headers: {
            'x-access-token': token
          }
        });
        
        if (!response.ok) {
          throw new Error(`获取社团信息失败，状态码: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log("社团数据:", data);
      
      if (data.success) {
        // 检查响应数据格式
        if (data.data && !Array.isArray(data.data)) {
          // 直接使用对象
          setClub(data.data);
        } else if (Array.isArray(data.data) && data.data.length > 0) {
          // 如果是数组，使用第一项
          setClub(data.data[0]);
        } else {
          throw new Error("获取社团信息失败: 没有找到社团数据");
        }
      } else {
        messageApi.error('获取社团信息失败');
        router.push('/admin/clubs');
      }
    } catch (error) {
      console.error('获取社团信息失败:', error);
      notification.error({
        message: '获取社团信息失败',
        description: error instanceof Error ? error.message : '未知错误',
        duration: 4
      });
      setError(error instanceof Error ? error.message : '未知错误');
      // 延迟跳转，让用户看到错误信息
      setTimeout(() => {
        router.push('/admin/clubs');
      }, 2000);
    } finally {
      setLoadingClub(false);
    }
  };

  const fetchUsers = async (token: string) => {
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
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      notification.error({
        message: '获取用户列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        duration: 4
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // 测试模式下模拟删除
      if (testMode) {
        setMembers(members.filter(member => member.id !== id));
        messageApi.success('成员已移除（测试模式）');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) return;

      messageApi.loading('正在移除成员...');
      
      // 获取要删除的成员记录
      const memberToDelete = members.find(m => m.id === id);
      if (!memberToDelete) {
        throw new Error('找不到要删除的成员记录');
      }
      
      // 修正API路径
      const response = await fetch(`http://localhost:8080/api/club-members/${id}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '移除成员失败');
      }

      messageApi.success('成员已移除');
      // 刷新成员列表
      fetchAllMembers(token);
    } catch (error) {
      console.error('移除成员失败:', error);
      notification.error({
        message: '移除成员失败',
        description: error instanceof Error ? error.message : '未知错误',
        duration: 4
      });
    }
  };

  const showModal = (member?: ClubMember) => {
    if (member) {
      setEditingMember(member);
      form.setFieldsValue({
        ...member,
        join_date: dayjs(member.join_date)
      });
    } else {
      setEditingMember(null);
      form.resetFields();
      form.setFieldsValue({ 
        club_id: filterClubId || undefined,  // 使用当前过滤的社团ID
        role: 0,  // 默认普通成员
        join_date: dayjs()
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingMember(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      // 获取token
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // 检查是否正在编辑社长且尝试修改角色
      if (editingMember && editingMember.role === 2 && values.role !== 2) {
        messageApi.error('社长角色不能直接修改为其他角色');
        return;
      }
      
      // 检查是否将成员设置为社长(role=2)
      if (values.role === 2) {
        // 找到这个社团当前的社长
        const currentLeader = members.find(m => m.club_id === values.club_id && m.role === 2);
        
        // 如果当前已有社长，且不是正在编辑的成员
        if (currentLeader && (!editingMember || (editingMember && currentLeader.id !== editingMember.id))) {
          // 确认是否要更换社长
          Modal.confirm({
            title: '更换社长确认',
            icon: <ExclamationCircleOutlined />,
            content: `该社团已有社长(${currentLeader.username})，将其降级为普通成员并设置新社长?`,
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
              try {
                // 准备更新数据
                const memberData = {
                  user_id: values.user_id,
                  club_id: values.club_id,
                  role: values.role,
                  join_date: values.join_date.format('YYYY-MM-DD')
                };
                
                // 先将原社长降级为普通成员
                const demoteResponse = await fetch(`http://localhost:8080/api/club-members/${currentLeader.id}/role`, {
                  method: 'PUT',
                  headers: {
                    'x-access-token': token,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ role: 1 }) // 设为普通成员
                });
                
                if (!demoteResponse.ok) {
                  const errorData = await demoteResponse.json().catch(() => ({}));
                  throw new Error(errorData.message || '降级原社长失败');
                }
                
                // 然后保存当前编辑或新增的成员
                if (editingMember) {
                  // 修正更新成员的API路径
                  const updateResponse = await fetch(`http://localhost:8080/api/club-members/${editingMember.id}`, {
                    method: 'PUT',
                    headers: {
                      'x-access-token': token,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(memberData)
                  });
                  
                  if (!updateResponse.ok) {
                    const errorData = await updateResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || '更新成员信息失败');
                  }
                  
                  messageApi.success('成员信息更新成功');
                } else {
                  // 修正添加成员的API路径
                  const addResponse = await fetch(`http://localhost:8080/api/club-members`, {
                    method: 'POST',
                    headers: {
                      'x-access-token': token,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(memberData)
                  });
                  
                  if (!addResponse.ok) {
                    const errorData = await addResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || '添加成员失败');
                  }
                  
                  messageApi.success('成员添加成功');
                }
                
                setIsModalVisible(false);
                form.resetFields();
                setEditingMember(null);
                fetchAllMembers(token);
              } catch (error) {
                console.error('保存成员信息失败:', error);
                notification.error({
                  message: '保存成员信息失败',
                  description: error instanceof Error ? error.message : '未知错误',
                  duration: 4
                });
              }
            }
          });
          return;
        }
      }
      
      // 如果不需要处理社长角色冲突，直接保存
      const memberData = {
        user_id: values.user_id,
        club_id: values.club_id,
        role: values.role,
        join_date: values.join_date.format('YYYY-MM-DD')
      };
      
      try {
        if (editingMember) {
          // 修正更新成员的API路径
          const response = await fetch(`http://localhost:8080/api/club-members/${editingMember.id}`, {
            method: 'PUT',
            headers: {
              'x-access-token': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '更新成员信息失败');
          }
          
          messageApi.success('成员信息更新成功');
        } else {
          // 修正添加成员的API路径
          const response = await fetch(`http://localhost:8080/api/club-members`, {
            method: 'POST',
            headers: {
              'x-access-token': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '添加成员失败');
          }
          
          messageApi.success('成员添加成功');
        }
        
        setIsModalVisible(false);
        form.resetFields();
        setEditingMember(null);
        fetchAllMembers(token);
      } catch (error) {
        console.error('保存成员信息失败:', error);
        notification.error({
          message: '保存成员信息失败',
          description: error instanceof Error ? error.message : '未知错误',
          duration: 4
        });
      }
    } catch (error) {
      console.error('保存成员信息失败:', error);
      notification.error({
        message: '保存成员信息失败',
        description: error instanceof Error ? error.message : '未知错误',
        duration: 4
      });
    }
  };

  // 过滤已有成员，避免重复添加，同时排除管理员
  const getUserOptions = () => {
    const existingUserIds = members.map(member => member.user_id);
    return users.filter(user => 
      // 排除管理员用户，假设 role === 0 是管理员
      user.role !== 0 && 
      (!existingUserIds.includes(user.id) || 
      (editingMember && editingMember.user_id === user.id))
    );
  };

  const getMemberRoleTag = (role: number) => {
    switch (role) {
      case 2: // 社长
        return <Tag color="volcano">社长</Tag>;
      case 3: // 副社长
        return <Tag color="orange">副社长</Tag>;
      case 1: // 普通成员
      default:
        return <Tag color="green">普通成员</Tag>;
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="red">禁用</Tag>;
      case 1:
        return <Tag color="green">正常</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };

  // 过滤显示的成员列表
  const filteredMembers = members.filter(member => 
    filterClubId ? member.club_id === filterClubId : true
  );

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
      title: '社团',
      dataIndex: 'club_name',
      key: 'club_name',
      render: (text: string, record: ClubMember) => {
        // 如果没有club_name字段，尝试从clubs列表中查找
        const clubName = text || clubs.find(c => c.id === record.club_id)?.name || '未知社团';
        return <Tag color="blue">{clubName}</Tag>;
      },
      filters: clubs.map(club => ({ text: club.name, value: club.id })),
      onFilter: (value: any, record: ClubMember) => record.club_id === Number(value),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: number) => getMemberRoleTag(role),
      filters: [
        { text: '社长', value: 2 },
        { text: '副社长', value: 3 },
        { text: '普通成员', value: 1 },
      ],
      onFilter: (value: any, record: ClubMember) => record.role === Number(value),
    },
    {
      title: '加入日期',
      dataIndex: 'join_date',
      key: 'join_date',
      render: (text: string) => new Date(text).toLocaleDateString(),
      sorter: (a: ClubMember, b: ClubMember) => 
        new Date(a.join_date).getTime() - new Date(b.join_date).getTime(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => getStatusTag(status),
      filters: [
        { text: '正常', value: 1 },
        { text: '禁用', value: 0 },
      ],
      onFilter: (value: any, record: ClubMember) => record.status === Number(value),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ClubMember) => (
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
            title="确定要移除这个成员吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              disabled={record.role === 2} // 社长不可删除，role=2表示社长
            >
              移除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <App>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/admin/clubs')}
            style={{ paddingLeft: 0 }}
          >
            返回社团列表
          </Button>
        </div>
        
        {testMode && (
          <Alert
            message="测试模式"
            description="当前处于测试模式，显示的是模拟数据，API请求已被禁用"
            type="warning"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}
        
        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
            action={
              <Button onClick={() => router.push('/admin/clubs')} type="primary" size="small">
                返回社团列表
              </Button>
            }
          />
        )}
        
        {loadingClub ? (
          <Card style={{ textAlign: 'center', padding: '30px 0' }}>
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} 
              tip="加载社团信息..."
            />
          </Card>
        ) : !club && !error ? (
          <Result
            status="warning"
            title="未找到社团信息"
            subTitle="无法加载指定社团的数据，请确认社团ID是否正确"
            extra={
              <Button type="primary" onClick={() => router.push('/admin/clubs')}>
                返回社团列表
              </Button>
            }
          />
        ) : club && (
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ fontSize: '18px', marginRight: '10px', color: '#1890ff' }} />
                <span style={{ fontSize: '16px', fontWeight: 600 }}>
                  {club ? `${club.name} - 成员管理` : '社团成员管理'}
                </span>
              </div>
            }
            bordered={false}
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            extra={
              <Space>
                {!clubId && (
                  <Select
                    placeholder="选择社团"
                    style={{ width: 180 }}
                    allowClear
                    value={filterClubId}
                    onChange={(value) => setFilterClubId(value)}
                  >
                    {clubs.map(club => (
                      <Option key={club.id} value={club.id}>{club.name}</Option>
                    ))}
                  </Select>
                )}
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => showModal()}
                  style={{ borderRadius: '4px', fontWeight: 500 }}
                >
                  添加成员
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredMembers}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 10,
                showTotal: (total) => `共 ${total} 个成员`
              }}
              style={{ marginTop: '8px' }}
              rowClassName={() => 'member-table-row'}
              className="custom-table"
              scroll={{ x: 800 }}
              locale={{
                emptyText: filterClubId ? '该社团暂无成员' : '暂无社团成员'
              }}
            />
          </Card>
        )}

        {/* 成员创建/编辑表单 */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {editingMember ? (
                <EditOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              ) : (
                <PlusOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              )}
              <span>{editingMember ? '编辑成员' : '添加成员'}</span>
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
              name="club_id"
              label="选择社团"
              rules={[{ required: true, message: '请选择社团' }]}
            >
              <Select 
                placeholder="请选择社团"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                disabled={editingMember !== null}
              >
                {clubs.map(club => (
                  <Option key={club.id} value={club.id}>{club.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="user_id"
              label="选择用户"
              rules={[{ required: true, message: '请选择用户' }]}
            >
              <Select 
                placeholder="请选择用户"
                showSearch
                optionFilterProp="children"
                disabled={!!editingMember}
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {getUserOptions().map(user => (
                  <Option key={user.id} value={user.id}>{user.username} ({user.email})</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="role"
              label="成员角色"
              rules={[{ required: true, message: '请选择成员角色' }]}
            >
              <Select placeholder="请选择成员角色">
                <Option value={1}>普通成员</Option>
                <Option value={2}>社长</Option>
                <Option value={3}>副社长</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="join_date"
              label="加入日期"
              rules={[{ required: true, message: '请选择加入日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button onClick={handleCancel}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingMember ? '更新' : '添加'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* 添加CSS样式 */}
        <style jsx global>{`
          .custom-table .ant-table-thead > tr > th {
            background-color: #f8f9fa;
            color: #262626;
            font-weight: 600;
          }
          
          .member-table-row {
            transition: all 0.3s;
          }
          
          .member-table-row:hover {
            background-color: #f0f7ff !important;
          }
          
          .ant-tag {
            border-radius: 4px;
            font-weight: 500;
            padding: 0 8px;
          }
          
          .ant-modal-header {
            border-bottom: 1px solid #f0f0f0;
            padding: 16px 24px;
          }
          
          .ant-card-head-title {
            font-weight: 600;
          }
        `}</style>
      </div>
    </App>
  );
};

export default ClubMembersPage;