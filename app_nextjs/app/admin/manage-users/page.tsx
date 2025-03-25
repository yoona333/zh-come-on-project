'use client';

import { useState, useRef } from 'react';
import { Card, Table, Tag, Button, Space, Input, Form, Row, Col, Select, DatePicker, Modal, message, Popconfirm, Switch } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UserOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from '../../../src/styles/Admin.module.scss';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

interface User {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: 'student' | 'club_admin' | 'admin';
  status: 'active' | 'inactive';
  registerDate: string;
  lastLogin: string;
  points: number;
}

export default function ManageUsers() {
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const searchInput = useRef<InputRef>(null);
  
  // 模拟数据
  const data: User[] = [
    {
      key: '1',
      id: '20210001',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      department: '计算机科学与技术学院',
      role: 'student',
      status: 'active',
      registerDate: '2021-09-01',
      lastLogin: '2023-06-10 14:30',
      points: 156,
    },
    {
      key: '2',
      id: '20210002',
      name: '李四',
      email: 'lisi@example.com',
      phone: '13800138001',
      department: '机械工程学院',
      role: 'student',
      status: 'active',
      registerDate: '2021-09-01',
      lastLogin: '2023-06-09 10:15',
      points: 120,
    },
    {
      key: '3',
      id: '20210003',
      name: '王五',
      email: 'wangwu@example.com',
      phone: '13800138002',
      department: '电子信息学院',
      role: 'club_admin',
      status: 'active',
      registerDate: '2021-09-01',
      lastLogin: '2023-06-08 16:45',
      points: 90,
    },
    {
      key: '4',
      id: '20210004',
      name: '赵六',
      email: 'zhaoliu@example.com',
      phone: '13800138003',
      department: '管理学院',
      role: 'student',
      status: 'inactive',
      registerDate: '2021-09-01',
      lastLogin: '2023-05-20 09:30',
      points: 75,
    },
    {
      key: '5',
      id: 'admin001',
      name: '管理员',
      email: 'admin@example.com',
      phone: '13900139000',
      department: '系统管理部',
      role: 'admin',
      status: 'active',
      registerDate: '2021-01-01',
      lastLogin: '2023-06-10 18:20',
      points: 0,
    },
  ];
  
  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '学号/工号',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
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
      title: '院系',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = '';
        let text = '';
        
        switch(role) {
          case 'student':
            color = 'blue';
            text = '学生';
            break;
          case 'club_admin':
            color = 'purple';
            text = '社团管理员';
            break;
          case 'admin':
            color = 'gold';
            text = '系统管理员';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '学生', value: 'student' },
        { text: '社团管理员', value: 'club_admin' },
        { text: '系统管理员', value: 'admin' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch 
          checkedChildren="启用" 
          unCheckedChildren="禁用" 
          checked={status === 'active'} 
          onChange={(checked) => handleStatusChange(record.id, checked)}
        />
      ),
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      sorter: (a, b) => a.points - b.points,
    },
    {
      title: '注册时间',
      dataIndex: 'registerDate',
      key: 'registerDate',
      sorter: (a, b) => new Date(a.registerDate).getTime() - new Date(b.registerDate).getTime(),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      sorter: (a, b) => new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div className={styles.actionColumn}>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            size="small" 
            icon={<LockOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          <Popconfirm
            title="删除用户"
            description="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  
  // 处理搜索
  const handleSearch = (values: any) => {
    setLoading(true);
    console.log('搜索参数:', values);
    
    // 模拟API调用
    setTimeout(() => {
      message.success('搜索完成');
      setLoading(false);
    }, 1000);
  };
  
  // 重置搜索表单
  const handleReset = () => {
    form.resetFields();
  };
  
  // 处理添加用户
  const handleAdd = () => {
    message.info('添加用户功能正在开发中...');
  };
  
  // 处理编辑用户
  const handleEdit = (record: User) => {
    message.info(`编辑用户: ${record.name}`);
  };
  
  // 处理删除用户
  const handleDelete = (record: User) => {
    message.success(`已删除用户：${record.name}`);
    // 实际应用中应该调用API删除数据
  };
  
  // 处理重置密码
  const handleResetPassword = (record: User) => {
    confirm({
      title: '重置密码',
      icon: <ExclamationCircleOutlined />,
      content: `确定要重置 ${record.name} 的密码吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        message.success(`已重置 ${record.name} 的密码`);
        // 实际应用中应该调用API重置密码
      },
    });
  };
  
  // 处理用户状态变更
  const handleStatusChange = (userId: string, checked: boolean) => {
    const status = checked ? 'active' : 'inactive';
    message.success(`用户 ${userId} 状态已更改为 ${checked ? '启用' : '禁用'}`);
    // 实际应用中应该调用API更新用户状态
  };
  
  // 批量删除
  const handleBatchDelete = () => {
    confirm({
      title: '批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 个用户吗？此操作不可恢复。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success(`已删除 ${selectedRowKeys.length} 个用户`);
        setSelectedRowKeys([]);
        // 实际应用中应该调用API批量删除数据
      },
    });
  };
  
  // 批量启用
  const handleBatchEnable = () => {
    message.success(`已启用 ${selectedRowKeys.length} 个用户`);
    setSelectedRowKeys([]);
    // 实际应用中应该调用API批量更新数据
  };
  
  // 批量禁用
  const handleBatchDisable = () => {
    message.success(`已禁用 ${selectedRowKeys.length} 个用户`);
    setSelectedRowKeys([]);
    // 实际应用中应该调用API批量更新数据
  };
  
  // 处理表格选择变化
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  return (
    <div className={styles.adminPage}>
      <h2>用户管理</h2>
      
      <Card className={styles.searchForm}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="id" label="学号/工号">
                <Input placeholder="请输入学号或工号" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="name" label="姓名">
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="department" label="院系">
                <Input placeholder="请输入院系" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="role" label="角色">
                <Select placeholder="请选择角色" allowClear>
                  <Option value="student">学生</Option>
                  <Option value="club_admin">社团管理员</Option>
                  <Option value="admin">系统管理员</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="active">启用</Option>
                  <Option value="inactive">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="registerDateRange" label="注册时间">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className={styles.buttons}>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
                搜索
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
      
      <div className={styles.batchActions}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加用户
        </Button>
        <div>
          {selectedRowKeys.length > 0 && (
            <>
              <Button 
                type="primary" 
                onClick={handleBatchEnable}
                style={{ marginRight: 8 }}
              >
                批量启用
              </Button>
              <Button 
                onClick={handleBatchDisable}
                style={{ marginRight: 8 }}
              >
                批量禁用
              </Button>
              <Button 
                danger 
                onClick={handleBatchDelete}
              >
                批量删除
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Card className={styles.tableCard}>
        <Table 
          rowSelection={rowSelection}
          columns={columns} 
          dataSource={data} 
          rowKey="key"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1300 }}
        />
      </Card>
    </div>
  );
} 