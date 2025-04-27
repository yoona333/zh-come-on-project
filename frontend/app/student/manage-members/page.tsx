'use client';

import { useState, useEffect } from 'react';
import { Table, Button, message, Modal, Input, Form, Select, Space, Tag, Spin, List, Radio } from 'antd';
import { UserAddOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const { Option } = Select;
const { confirm } = Modal;

interface Member {
  id: number;
  user_id: number;
  username: string;
  email: string;
  phone: string;
  department: string;
  major: string;
  role: number;
  join_date: string;
  status: number;
}

interface Student {
  id: number;
  username: string;
  email: string;
  phone: string;
  department: string;
  major: string;
  class: string;
}

export default function ManageMembers() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [clubInfo, setClubInfo] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [searchStudents, setSearchStudents] = useState<Student[]>([]);
  const [studentSearchValue, setStudentSearchValue] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // 检查使用的是哪种存储方式（localStorage或sessionStorage）
    const authMode = sessionStorage.getItem('auth_mode');
    const storage = authMode === 'session' ? sessionStorage : localStorage;
    
    const token = storage.getItem('token');
    const role = storage.getItem('role');

    if (!token) {
      message.error('请先登录');
      router.push('/login');
      return;
    }

    // 确保在每次页面加载时重新验证用户角色
    try {
      // 向后端发送请求验证当前token对应的实际角色
      const validationResponse = await axios.get('http://localhost:8080/api/user/profile', {
        headers: { 'x-access-token': token }
      });
      
      if (!validationResponse.data.success) {
        message.error('会话已过期，请重新登录');
        router.push('/login');
        return;
      }
      
      const actualRole = validationResponse.data.data.role.toString();
      
      // 如果storage中的角色与实际角色不匹配，更新storage
      if (role !== actualRole) {
        storage.setItem('role', actualRole);
      }
      
      // 检查是否是社长
      if (actualRole !== '2') {
        message.error('您没有权限访问此页面');
        router.push('/student');
        return;
      }
    } catch (error) {
      console.error('验证用户角色失败:', error);
      message.error('验证用户身份失败，请重新登录');
      router.push('/login');
      return;
    }

    await fetchClubInfo(token);
  };

  const fetchClubInfo = async (token: string) => {
    try {
      // 修改为正确的后端API路径
      const response = await axios.get('http://localhost:8080/student/manage-members', {
        headers: { 'x-access-token': token }
      });
      
      console.log('社团API返回数据:', response.data);
      
      if (response.data.success) {
        // 注意后端响应结构的变化，调整数据获取方式
        if (response.data.data && response.data.data.club) {
          setClubInfo(response.data.data.club);
          // 如果后端已经返回了成员列表，直接使用
          if (response.data.data.members) {
            setMembers(response.data.data.members);
            setLoading(false);
          } else {
            // 否则，使用club.id获取成员列表
            await fetchMembers(token, response.data.data.club.id);
          }
        } else {
          message.error('未能获取社团信息');
          setLoading(false);
        }
      } else {
        message.error('您不是任何社团的社长');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('获取社团信息失败:', error);
      message.error('获取社团信息失败: ' + (error.response?.data?.message || error.message || '未知错误'));
      setLoading(false);
    }
  };
  
  const fetchMembers = async (token: string, clubId: number) => {
    try {
      // 修改为正确的后端API路径
      const response = await axios.get(`http://localhost:8080/student/manage-members/club-members`, {
        headers: { 'x-access-token': token }
      });
  
      if (response.data.success) {
        setMembers(response.data.data || []);
      } else {
        message.error(response.data.message || '获取成员列表失败');
      }
    } catch (error: any) {
      console.error('获取社团成员失败:', error);
      message.error('获取社团成员失败: ' + (error.response?.data?.message || error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 检查使用的是哪种存储方式
      const authMode = sessionStorage.getItem('auth_mode');
      const storage = authMode === 'session' ? sessionStorage : localStorage;
      const token = storage.getItem('token');

      const response = await axios.post(`http://localhost:8080/student/manage-members/${clubInfo.id}/add-member`, {
        user_id: values.user_id || null,
        username: values.username,
        email: values.email,
        role: values.role
      }, {
        headers: { 'x-access-token': token }
      });

      if (response.data.success) {
        message.success('添加成员成功');
        setModalVisible(false);
        // 重新获取成员列表
        await fetchMembers(token!, clubInfo.id);
      } else {
        message.error(response.data.message || '添加成员失败');
      }
    } catch (error: any) {
      console.error('添加成员失败:', error);
      message.error('添加成员失败: ' + (error.response?.data?.message || error.message || '未知错误'));
    }
  };

  const handleRemoveMember = (record: Member) => {
    // 检查使用的是哪种存储方式
    const authMode = sessionStorage.getItem('auth_mode');
    const storage = authMode === 'session' ? sessionStorage : localStorage;
    const token = storage.getItem('token');
    
    confirm({
      title: '确认移除成员',
      icon: <ExclamationCircleOutlined />,
      content: `确定要将 ${record.username} 从社团中移除吗？`,
      onOk: async () => {
        try {
          const response = await axios.delete(`http://localhost:8080/student/manage-members/${record.id}`, {
            headers: { 'x-access-token': token }
          });

          if (response.data.success) {
            message.success('成员已移除');
            // 重新获取成员列表
            await fetchMembers(token!, clubInfo.id);
          } else {
            message.error(response.data.message || '移除成员失败');
          }
        } catch (error: any) {
          console.error('移除成员失败:', error);
          message.error('移除成员失败: ' + (error.response?.data?.message || error.message || '未知错误'));
        }
      }
    });
  };

  const handleChangeRole = async (memberId: number, newRole: number) => {
    // 检查使用的是哪种存储方式
    const authMode = sessionStorage.getItem('auth_mode');
    const storage = authMode === 'session' ? sessionStorage : localStorage;
    const token = storage.getItem('token');
    
    try {
      // 显示确认对话框
      const roleText = newRole === 2 ? '社长' : '普通成员';
      
      confirm({
        title: `角色变更确认`,
        icon: <ExclamationCircleOutlined />,
        content: `您确定要将此成员设为${roleText}吗？${newRole === 2 ? '注意：如果当前社团已有社长，原社长将被降为普通成员。' : ''}`,
        onOk: async () => {
          // 尝试使用社长API路径
          try {
            const response = await axios.put(`http://localhost:8080/student/manage-members/${memberId}`, {
              role: newRole
            }, {
              headers: { 'x-access-token': token }
            });

            if (response.data.success) {
              message.success(response.data.message || `成员角色已更新为${roleText}`);
              // 重新获取成员列表
              await fetchMembers(token!, clubInfo.id);
            } else {
              message.error(response.data.message || '更新成员角色失败');
            }
          } catch (studentApiError: any) {
            console.error('使用社长API更新角色失败，尝试管理员API:', studentApiError);
            
            // 如果社长API失败，尝试使用管理员API路径
            try {
              const adminResponse = await axios.put(`http://localhost:8080/api/club-members/${memberId}/role`, {
                role: newRole
              }, {
                headers: { 'x-access-token': token }
              });
              
              if (adminResponse.data.success) {
                message.success(adminResponse.data.message || `成员角色已更新为${roleText}`);
                // 重新获取成员列表
                await fetchMembers(token!, clubInfo.id);
              } else {
                message.error(adminResponse.data.message || '更新成员角色失败');
              }
            } catch (adminApiError: any) {
              console.error('两种API都失败:', adminApiError);
              message.error('更新成员角色失败: ' + (adminApiError.response?.data?.message || adminApiError.message || '未知错误'));
            }
          }
        },
        onCancel() {
          // 用户取消操作
        },
      });
    } catch (error: any) {
      console.error('角色更新过程中出错:', error);
      message.error('角色更新过程中出错');
    }
  };

  const handleSearch = async (values: any) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get(`http://localhost:8080/student/manage-members/search`, {
        headers: { 'x-access-token': token },
        params: values
      });

      if (response.data.success) {
        setMembers(response.data.data || []);
      } else {
        message.error(response.data.message || '搜索成员失败');
      }
    } catch (error: any) {
      console.error('搜索成员失败:', error);
      message.error('搜索成员失败: ' + (error.response?.data?.message || error.message || '未知错误'));
    }
  };

  // 搜索学生函数
  const handleSearchStudents = async (value: string) => {
    if (!value || value.length < 2) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/student/search-students', {
        headers: { 'x-access-token': token },
        params: { 
          keyword: value,  // 关键词搜索
          role: 1,         // 只搜索学生角色
          excludeClub: clubInfo.id // 排除已加入的成员
        }
      });
      
      if (response.data.success) {
        setSearchStudents(response.data.data || []);
      }
    } catch (error: any) {
      console.error('搜索学生失败:', error);
    }
  };
  
  // 选择学生处理函数
  const handleSelectStudent = (student: Student) => {
    form.setFieldsValue({
      user_id: student.id,
      username: student.username,
      email: student.email || '',
      department: student.department || ''
    });
    setSearchStudents([]);
    setStudentSearchValue('');
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '学院',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '专业',
      dataIndex: 'major',
      key: 'major',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: number) => (
        role === 2 ? <Tag color="gold">社长</Tag> : <Tag color="blue">成员</Tag>
      )
    },
    {
      title: '加入时间',
      dataIndex: 'join_date',
      key: 'join_date',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Member) => (
        <Space size="middle">
          {record.role !== 2 && (
            <Button 
              size="small" 
              type="link" 
              onClick={() => handleChangeRole(record.id, 2)}
            >
              {/* 设为社长 */}
            </Button>
          )}
          {record.role === 2 && record.user_id !== clubInfo?.leader_id && (
            <Button 
              size="small" 
              type="link" 
              onClick={() => handleChangeRole(record.id, 1)}
            >
              {/* 降为成员 */}
            </Button>
          )}
          {record.user_id !== clubInfo?.leader_id && (
            <Button 
              size="small" 
              type="link" 
              danger 
              onClick={() => handleRemoveMember(record)}
            >
              移除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const addMemberModal = (
    <Modal
      title="添加社团成员"
      open={modalVisible}
      onOk={handleSubmit}
      onCancel={() => setModalVisible(false)}
      width={600}
    >
      <div style={{ marginBottom: 20 }}>
        <p>搜索学生:</p>
        <Input.Search
          placeholder="输入姓名、班级或学院搜索"
          value={studentSearchValue}
          onChange={(e) => setStudentSearchValue(e.target.value)}
          onSearch={handleSearchStudents}
          style={{ width: '100%' }}
        />
        
        {searchStudents.length > 0 && (
          <div style={{ marginTop: 10, maxHeight: 200, overflow: 'auto', border: '1px solid #e8e8e8', borderRadius: 4 }}>
            <List
              size="small"
              dataSource={searchStudents}
              renderItem={(item: Student) => (
                <List.Item 
                  key={item.id}
                  style={{ cursor: 'pointer', padding: '8px 12px' }}
                  onClick={() => handleSelectStudent(item)}
                >
                  <div>
                    <b>{item.username}</b> - {item.department} {item.major} {item.class}
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {item.email} | {item.phone}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
      
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="user_id"
          label="学生ID"
          hidden={true}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="username"
          label="姓名"
          rules={[{ required: true, message: '请选择或输入学生姓名' }]}
        >
          <Input placeholder="请从上方搜索并选择学生" disabled />
        </Form.Item>
        
        <Form.Item
          name="email"
          label="邮箱"
          rules={[{ type: 'email', message: '请输入有效邮箱' }]}
        >
          <Input disabled />
        </Form.Item>
        
        <Form.Item
          name="department"
          label="学院"
        >
          <Input disabled />
        </Form.Item>
        
        <Form.Item
          name="role"
          label="角色"
          initialValue={1}
        >
          <Radio.Group>
            <Radio value={1}>普通成员</Radio>
            <Radio value={2}>社长</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>{clubInfo?.name} - 成员管理</h2>
        <Button 
          type="primary" 
          icon={<UserAddOutlined />} 
          onClick={handleAddMember}
        >
          添加成员
        </Button>
      </div>

      <Form
        form={searchForm}
        layout="inline"
        onFinish={handleSearch}
        style={{ marginBottom: '20px' }}
      >
        <Form.Item name="username" label="姓名">
          <Input placeholder="输入姓名搜索" />
        </Form.Item>
        <Form.Item name="department" label="学院">
          <Input placeholder="输入学院搜索" />
        </Form.Item>
        <Form.Item name="role" label="角色">
          <Select style={{ width: 120 }} allowClear placeholder="选择角色">
            <Option value={1}>成员</Option>
            <Option value={2}>社长</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
          <Button 
            style={{ margin: '0 8px' }} 
            onClick={() => {
              searchForm.resetFields();
              handleSearch({});
            }}
          >
            重置
          </Button>
        </Form.Item>
      </Form>

      <Table 
        columns={columns} 
        dataSource={members} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
      />

      {addMemberModal}
    </div>
  );
} 