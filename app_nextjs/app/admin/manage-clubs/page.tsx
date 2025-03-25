'use client';

import { useState, useRef } from 'react';
import { Card, Table, Tag, Button, Space, Input, Form, Row, Col, Select, DatePicker, Modal, message, Popconfirm, Avatar } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, TeamOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from '../../../src/styles/Admin.module.scss';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

interface Club {
  key: string;
  id: number;
  name: string;
  logo: string;
  category: string;
  president: string;
  memberCount: number;
  activityCount: number;
  createDate: string;
  status: 'active' | 'inactive' | 'pending';
  description: string;
}

export default function ManageClubs() {
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const searchInput = useRef<InputRef>(null);
  
  // 模拟数据
  const data: Club[] = [
    {
      key: '1',
      id: 1,
      name: '计算机协会',
      logo: 'https://randomuser.me/api/portraits/men/1.jpg',
      category: '科技',
      president: '张三',
      memberCount: 120,
      activityCount: 15,
      createDate: '2021-09-15',
      status: 'active',
      description: '致力于推广计算机知识和技能，举办各类编程比赛和技术讲座。',
    },
    {
      key: '2',
      id: 2,
      name: '篮球社',
      logo: 'https://randomuser.me/api/portraits/men/2.jpg',
      category: '体育',
      president: '李四',
      memberCount: 85,
      activityCount: 10,
      createDate: '2020-10-05',
      status: 'active',
      description: '组织校内篮球比赛和训练，提高学生篮球技能和体育素养。',
    },
    {
      key: '3',
      id: 3,
      name: '摄影协会',
      logo: 'https://randomuser.me/api/portraits/women/3.jpg',
      category: '艺术',
      president: '王五',
      memberCount: 65,
      activityCount: 8,
      createDate: '2022-03-10',
      status: 'active',
      description: '探索摄影艺术，定期举办摄影展和外出采风活动。',
    },
    {
      key: '4',
      id: 4,
      name: '创业协会',
      logo: 'https://randomuser.me/api/portraits/men/4.jpg',
      category: '创业',
      president: '赵六',
      memberCount: 50,
      activityCount: 5,
      createDate: '2022-09-20',
      status: 'inactive',
      description: '为有创业想法的学生提供支持和资源，组织创业讲座和比赛。',
    },
    {
      key: '5',
      id: 5,
      name: '音乐社',
      logo: 'https://randomuser.me/api/portraits/women/5.jpg',
      category: '艺术',
      president: '钱七',
      memberCount: 90,
      activityCount: 12,
      createDate: '2021-04-15',
      status: 'active',
      description: '培养学生音乐才能，组织校园音乐会和歌唱比赛。',
    },
    {
      key: '6',
      id: 6,
      name: '环保社团',
      logo: 'https://randomuser.me/api/portraits/women/6.jpg',
      category: '公益',
      president: '孙八',
      memberCount: 40,
      activityCount: 7,
      createDate: '2022-11-10',
      status: 'pending',
      description: '宣传环保理念，组织校园清洁和环保宣传活动。',
    },
  ];
  
  // 表格列定义
  const columns: ColumnsType<Club> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '社团名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={record.logo} icon={<TeamOutlined />} style={{ marginRight: 8 }} />
          <a>{text}</a>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: '科技', value: '科技' },
        { text: '体育', value: '体育' },
        { text: '艺术', value: '艺术' },
        { text: '创业', value: '创业' },
        { text: '公益', value: '公益' },
      ],
      onFilter: (value, record) => record.category === value,
      render: (category) => {
        let color = '';
        
        switch(category) {
          case '科技':
            color = 'blue';
            break;
          case '体育':
            color = 'green';
            break;
          case '艺术':
            color = 'purple';
            break;
          case '创业':
            color = 'orange';
            break;
          case '公益':
            color = 'cyan';
            break;
        }
        
        return <Tag color={color}>{category}</Tag>;
      },
    },
    {
      title: '社长',
      dataIndex: 'president',
      key: 'president',
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      sorter: (a, b) => a.memberCount - b.memberCount,
    },
    {
      title: '活动数',
      dataIndex: 'activityCount',
      key: 'activityCount',
      sorter: (a, b) => a.activityCount - b.activityCount,
    },
    {
      title: '创建时间',
      dataIndex: 'createDate',
      key: 'createDate',
      sorter: (a, b) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        
        switch(status) {
          case 'active':
            color = 'success';
            text = '活跃';
            break;
          case 'inactive':
            color = 'default';
            text = '不活跃';
            break;
          case 'pending':
            color = 'warning';
            text = '待审批';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '活跃', value: 'active' },
        { text: '不活跃', value: 'inactive' },
        { text: '待审批', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
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
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
                style={{ marginLeft: 8 }}
              >
                批准
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
                style={{ marginLeft: 8 }}
              >
                拒绝
              </Button>
            </>
          )}
          <Popconfirm
            title="删除社团"
            description="确定要删除这个社团吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              style={{ marginLeft: 8 }}
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
  
  // 处理添加社团
  const handleAdd = () => {
    message.info('添加社团功能正在开发中...');
  };
  
  // 处理编辑社团
  const handleEdit = (record: Club) => {
    message.info(`编辑社团: ${record.name}`);
  };
  
  // 处理批准社团
  const handleApprove = (record: Club) => {
    message.success(`已批准社团: ${record.name}`);
    // 实际应用中应该调用API更新社团状态
  };
  
  // 处理拒绝社团
  const handleReject = (record: Club) => {
    message.success(`已拒绝社团: ${record.name}`);
    // 实际应用中应该调用API更新社团状态
  };
  
  // 处理删除社团
  const handleDelete = (record: Club) => {
    message.success(`已删除社团: ${record.name}`);
    // 实际应用中应该调用API删除数据
  };
  
  // 批量删除
  const handleBatchDelete = () => {
    confirm({
      title: '批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 个社团吗？此操作不可恢复。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success(`已删除 ${selectedRowKeys.length} 个社团`);
        setSelectedRowKeys([]);
        // 实际应用中应该调用API批量删除数据
      },
    });
  };
  
  // 批量批准
  const handleBatchApprove = () => {
    message.success(`已批准 ${selectedRowKeys.length} 个社团`);
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
      <h2>社团管理</h2>
      
      <Card className={styles.searchForm}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="name" label="社团名称">
                <Input placeholder="请输入社团名称" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="president" label="社长">
                <Input placeholder="请输入社长姓名" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="category" label="分类">
                <Select placeholder="请选择分类" allowClear>
                  <Option value="科技">科技</Option>
                  <Option value="体育">体育</Option>
                  <Option value="艺术">艺术</Option>
                  <Option value="创业">创业</Option>
                  <Option value="公益">公益</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="active">活跃</Option>
                  <Option value="inactive">不活跃</Option>
                  <Option value="pending">待审批</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item name="createDateRange" label="创建时间">
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
          添加社团
        </Button>
        <div>
          {selectedRowKeys.length > 0 && (
            <>
              <Button 
                type="primary" 
                onClick={handleBatchApprove}
                style={{ marginRight: 8 }}
              >
                批量批准
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