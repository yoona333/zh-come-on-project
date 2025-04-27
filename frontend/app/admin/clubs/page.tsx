'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Tag, Button, Modal, Form, Input, Select, Space, Card, App, Row, Col, Avatar, Upload, Popconfirm, Tooltip, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, CalendarOutlined, UserOutlined, UploadOutlined, EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { jwtDecode } from 'jwt-decode';
import type { UploadProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Key } from 'react';

const { TextArea } = Input;
const { Option } = Select;

interface CustomJwtPayload {
  exp?: number;
  role: number;
  userId: number;
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
  member_count: number;
  activity_count: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: number;
}

const ClubListPage: React.FC = () => {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [viewingClub, setViewingClub] = useState<Club | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const { message: messageApi, notification } = App.useApp();
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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

      fetchClubs(token);
      fetchUsers(token);
    } catch (error) {
      messageApi.error('无效的登录信息，请重新登录');
      router.push('/login');
    }
  };

  const fetchClubs = async (token: string) => {
    try {
      setLoading(true);
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
      } else {
        console.error('数据格式错误:', data);
        notification.error({
          message: '获取社团列表失败',
          description: '数据格式不符合预期',
          duration: 4
        });
      }
    } catch (err) {
      console.error('获取社团列表失败:', err);
      notification.error({
        message: '获取社团列表失败',
        description: err instanceof Error ? err.message : '未知错误',
        duration: 4
      });
    } finally {
      setLoading(false);
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
      const token = localStorage.getItem('token');
      if (!token) return;

      messageApi.loading('正在删除社团...');
      
      const response = await fetch(`http://localhost:8080/api/clubs/${id}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '删除社团失败');
      }

      messageApi.success('社团已删除');
      fetchClubs(token);
    } catch (error) {
      console.error('删除社团失败:', error);
      notification.error({
        message: '删除社团失败',
        description: error instanceof Error ? error.message : '未知错误',
        duration: 4
      });
    }
  };

  const showModal = (club?: Club) => {
    if (club) {
      setEditingClub(club);
      form.setFieldsValue({
        ...club,
      });
      
      // 如果有logo，设置文件列表
      if (club.logo) {
        setFileList([
          {
            uid: '-1',
            name: 'logo.png',
            status: 'done',
            url: club.logo,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      setEditingClub(null);
      form.resetFields();
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const showViewModal = (club: Club) => {
    setViewingClub(club);
    setIsViewModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingClub(null);
    form.resetFields();
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setViewingClub(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // 处理文件上传
      let logoUrl = values.logo;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        // 这里应该是实际的文件上传逻辑，暂时保留之前的logo或使用假url
        logoUrl = fileList[0].url || 'http://example.com/fake-logo.png';
      }
      
      const clubData = {
        name: values.name,
        description: values.description,
        logo: logoUrl,
        status: values.status,
        leader_id: values.leader_id
      };
      
      messageApi.loading(editingClub ? '正在更新社团...' : '正在创建社团...');
      
      if (editingClub) {
        // 更新社团
        const response = await fetch(`http://localhost:8080/api/clubs/${editingClub.id}`, {
          method: 'PUT',
          headers: { 
            'x-access-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(clubData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '更新社团失败');
        }
        
        messageApi.success('社团更新成功');
      } else {
        // 创建社团
        const response = await fetch('http://localhost:8080/api/clubs', {
          method: 'POST',
          headers: { 
            'x-access-token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(clubData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '创建社团失败');
        }
        
        messageApi.success('社团创建成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setEditingClub(null);
      fetchClubs(token);
    } catch (error) {
      console.error('保存社团失败:', error);
      notification.error({
        message: '保存社团失败',
        description: error instanceof Error ? error.message : '未知错误',
        duration: 4
      });
    }
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
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

  const navigateToMembers = (clubId: number) => {
    console.log("点击管理成员按钮，社团ID:", clubId);
    if (clubId) {
      // 使用window.location.href直接跳转而不是router.push
      window.location.href = `/admin/clubs/members?clubId=${clubId}`;
    }
  };

  // 创建一个响应式的操作按钮渲染函数
  const renderActionButtons = (record: Club) => {
    // 使用状态中的窗口宽度而不是直接检查
    const isMobile = windowWidth < 768;
    
    // 处理成员管理按钮点击
    const handleMembersClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigateToMembers(record.id);
    };
    
    // 处理编辑按钮点击
    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      showModal(record);
    };
    
    return (
      <Space size="small" wrap={isMobile} direction={isMobile ? "vertical" : "horizontal"} onClick={e => e.stopPropagation()}>
        <Button 
          type="primary" 
          size="small" 
          icon={<TeamOutlined />} 
          onClick={handleMembersClick}
        >
          {isMobile ? '' : '管理成员'}
        </Button>
        <Button 
          type="primary" 
          size="small" 
          icon={<EditOutlined />} 
          onClick={handleEditClick}
        >
          {isMobile ? '' : '编辑'}
        </Button>
        <Popconfirm
          title="确定要删除这个社团吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button 
            type="primary" 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={e => e.stopPropagation()}
          >
            {isMobile ? '' : '删除'}
          </Button>
        </Popconfirm>
      </Space>
    );
  };

  const columns = [
    {
      title: '社团名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (text: string, record: Club) => (
        <a onClick={() => showViewModal(record)}>
          <Space>
            {record.logo ? (
              <Avatar src={record.logo} size="small" />
            ) : (
              <Avatar icon={<TeamOutlined />} size="small" />
            )}
            <span style={{ wordBreak: 'break-all' }}>{text}</span>
          </Space>
        </a>
      ),
    },
    {
      title: '社团简介',
      dataIndex: 'description',
      key: 'description',
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip placement="topLeft" title={description}>
          {description.length > 20 ? `${description.slice(0, 20)}...` : description}
        </Tooltip>
      ),
    },
    {
      title: '社长',
      dataIndex: 'leader_name',
      key: 'leader_name',
      width: 100,
    },
    {
      title: '成员数',
      dataIndex: 'member_count',
      key: 'member_count',
      width: 80,
      sorter: (a: Club, b: Club) => a.member_count - b.member_count,
    },
    {
      title: '活动数',
      dataIndex: 'activity_count',
      key: 'activity_count',
      width: 80,
      sorter: (a: Club, b: Club) => a.activity_count - b.activity_count,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (text: string) => new Date(text).toLocaleDateString(),
      sorter: (a: Club, b: Club) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center' as const,
      render: (status: number) => getStatusTag(status),
      filters: [
        { text: '正常', value: 1 },
        { text: '禁用', value: 0 },
      ],
      onFilter: (value: boolean | Key, record: Club) => record.status === Number(value),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: windowWidth < 768 ? 150 : 250,
      render: (_: any, record: Club) => renderActionButtons(record),
    },
  ];

  return (
    <App>
      <div style={{ padding: '24px' }}>
        {/* 添加一个测试按钮 */}
        <div style={{ marginBottom: '16px' }}>
    
        </div>
        
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <TeamOutlined style={{ fontSize: '18px', marginRight: '10px', color: '#1890ff' }} />
              <span style={{ fontSize: '16px', fontWeight: 600 }}>社团列表</span>
            </div>
          }
          bordered={false}
          style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showModal()}
              style={{ borderRadius: '4px', fontWeight: 500 }}
            >
              创建社团
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={clubs}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showTotal: (total) => `共 ${total} 个社团`
            }}
            style={{ marginTop: '8px' }}
            rowClassName={() => 'club-table-row'}
            className="custom-table"
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* 社团创建/编辑表单 */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {editingClub ? (
                <EditOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              ) : (
                <PlusOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              )}
              <span>{editingClub ? '编辑社团' : '创建社团'}</span>
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={700}
          destroyOnClose
          bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="社团名称"
              rules={[{ required: true, message: '请输入社团名称' }]}
            >
              <Input placeholder="请输入社团名称" />
            </Form.Item>

            <Form.Item
              name="description"
              label="社团简介"
              rules={[{ required: true, message: '请输入社团简介' }]}
            >
              <TextArea rows={4} placeholder="请输入社团简介" />
            </Form.Item>

            <Form.Item
              name="leader_id"
              label="社长"
              rules={[{ required: true, message: '请选择社长' }]}
            >
              <Select 
                placeholder="请选择社长"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {users.filter(user => user.role === 1 || user.role === 2).map(user => (
                  <Option key={user.id} value={user.id}>{user.username}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="logo"
              label="社团Logo"
            >
              <Upload {...uploadProps} listType="picture-card">
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传Logo</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item
              name="status"
              label="社团状态"
              initialValue={1}
            >
              <Select>
                <Option value={1}>正常</Option>
                <Option value={0}>禁用</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button onClick={handleCancel}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingClub ? '更新' : '创建'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* 社团详情查看模态框 */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              <span>社团详情</span>
            </div>
          }
          open={isViewModalVisible}
          onCancel={handleViewCancel}
          footer={[
            <Button key="back" onClick={handleViewCancel}>
              关闭
            </Button>,
            <Button 
              key="edit" 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => {
                handleViewCancel();
                if (viewingClub) showModal(viewingClub);
              }}
            >
              编辑
            </Button>,
          ]}
          width={700}
          bodyStyle={{ padding: '20px' }}
        >
          {viewingClub && (
            <div>
              <div style={{ 
                textAlign: 'center', 
                marginBottom: 32,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)',
                padding: '32px 0',
                borderRadius: '8px'
              }}>
                {viewingClub.logo ? (
                  <Avatar 
                    size={120} 
                    src={viewingClub.logo}
                    style={{ border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                  />
                ) : (
                  <Avatar 
                    size={120} 
                    icon={<TeamOutlined />} 
                    style={{ 
                      backgroundColor: '#1890ff',
                      border: '4px solid #fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                )}
                <h2 style={{ 
                  marginTop: 16, 
                  fontWeight: 600,
                  color: '#262626'
                }}>{viewingClub.name}</h2>
                <Tag color={viewingClub.status === 1 ? 'success' : 'error'} style={{ padding: '4px 10px' }}>
                  {viewingClub.status === 1 ? '正常' : '禁用'}
                </Tag>
              </div>
              
              <Row gutter={24} style={{ marginBottom: 32 }}>
                <Col span={8}>
                  <Card bordered={false} style={{ borderRadius: '8px' }}>
                    <Statistic 
                      title="成员数" 
                      value={viewingClub.member_count} 
                      prefix={<UserOutlined style={{ color: '#1890ff' }} />} 
                      valueStyle={{ color: '#1890ff', fontWeight: 600 }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card bordered={false} style={{ borderRadius: '8px' }}>
                    <Statistic 
                      title="活动数" 
                      value={viewingClub.activity_count} 
                      prefix={<CalendarOutlined style={{ color: '#52c41a' }} />} 
                      valueStyle={{ color: '#52c41a', fontWeight: 600 }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card bordered={false} style={{ borderRadius: '8px' }}>
                    <Statistic 
                      title="创建时间" 
                      value={new Date(viewingClub.created_at).toLocaleDateString()} 
                      prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
                      valueStyle={{ color: '#722ed1', fontWeight: 600 }}
                    />
                  </Card>
                </Col>
              </Row>
              
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    社团简介
                  </div>
                } 
                bordered={false} 
                style={{ 
                  marginBottom: 24,
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <p style={{ fontSize: '14px', lineHeight: '1.8', margin: 0 }}>
                  {viewingClub.description}
                </p>
              </Card>
              
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    社长信息
                  </div>
                } 
                bordered={false} 
                style={{ 
                  marginBottom: 24,
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    style={{ backgroundColor: '#1890ff', marginRight: 12 }}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{viewingClub.leader_name}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>社团负责人</div>
                  </div>
                </div>
              </Card>
              
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  type="primary" 
                  icon={<TeamOutlined />} 
                  size="large"
                  style={{ paddingLeft: 24, paddingRight: 24 }}
                  onClick={() => {
                    handleViewCancel();
                    navigateToMembers(viewingClub.id);
                  }}
                >
                  管理社团成员
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* 添加CSS样式 */}
        <style jsx global>{`
          .custom-table .ant-table-thead > tr > th {
            background-color: #f8f9fa;
            color: #262626;
            font-weight: 600;
          }
          
          .club-table-row {
            transition: all 0.3s;
          }
          
          .club-table-row:hover {
            background-color: #f0f7ff !important;
          }
          
          .ant-tag {
            border-radius: 4px;
            font-weight: 500;
          }
          
          .ant-statistic-title {
            color: #8c8c8c;
            font-size: 13px;
            margin-bottom: 4px;
          }
          
          .ant-modal-header {
            border-bottom: 1px solid #f0f0f0;
            padding: 16px 24px;
          }
          
          .ant-card-head-title {
            font-weight: 600;
          }

          /* 修复按钮溢出问题 */
          .ant-table-cell .ant-space {
            flex-wrap: wrap;
            row-gap: 8px;
          }

          @media (max-width: 768px) {
            .ant-table-cell {
              padding: 8px 4px !important;
            }
            
            .ant-btn-sm {
              padding: 0 8px;
              font-size: 12px;
              height: 28px;
            }
          }
        `}</style>
      </div>
    </App>
  );
};

export default ClubListPage; 