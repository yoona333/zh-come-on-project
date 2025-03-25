'use client';

import { useState, useRef } from 'react';
import { Card, Table, Tag, Button, Space, Input, Form, Row, Col, Select, DatePicker, Modal, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from '../../../src/styles/Admin.module.scss';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

interface Activity {
  key: string;
  id: number;
  title: string;
  date: string;
  location: string;
  organizer: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  points: number;
  maxParticipants: number;
  currentParticipants: number;
}

export default function ManageActivities() {
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const searchInput = useRef<InputRef>(null);
  
  // 模拟数据
  const data: Activity[] = [
    {
      key: '1',
      id: 1,
      title: '校园歌唱比赛',
      date: '2023-06-15 19:00',
      location: '大礼堂',
      organizer: '音乐社',
      status: 'approved',
      points: 10,
      maxParticipants: 100,
      currentParticipants: 45
    },
    {
      key: '2',
      id: 2,
      title: '志愿者服务日',
      date: '2023-06-18 09:00',
      location: '校门口',
      organizer: '青年志愿者协会',
      status: 'pending',
      points: 15,
      maxParticipants: 50,
      currentParticipants: 30
    },
    {
      key: '3',
      id: 3,
      title: '程序设计大赛',
      date: '2023-06-20 14:00',
      location: '计算机楼',
      organizer: '计算机协会',
      status: 'approved',
      points: 20,
      maxParticipants: 80,
      currentParticipants: 60
    },
    {
      key: '4',
      id: 4,
      title: '篮球友谊赛',
      date: '2023-06-25 15:00',
      location: '体育馆',
      organizer: '篮球社',
      status: 'rejected',
      points: 8,
      maxParticipants: 40,
      currentParticipants: 0
    },
    {
      key: '5',
      id: 5,
      title: '创新创业讲座',
      date: '2023-06-28 10:00',
      location: '报告厅',
      organizer: '创业协会',
      status: 'pending',
      points: 5,
      maxParticipants: 200,
      currentParticipants: 120
    },
  ];
  
  // 表格列定义
  const columns: ColumnsType<Activity> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '组织者',
      dataIndex: 'organizer',
      key: 'organizer',
    },
    {
      title: '时间',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        
        switch(status) {
          case 'pending':
            color = 'warning';
            text = '待审批';
            break;
          case 'approved':
            color = 'success';
            text = '已批准';
            break;
          case 'rejected':
            color = 'error';
            text = '已拒绝';
            break;
          case 'completed':
            color = 'default';
            text = '已完成';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '待审批', value: 'pending' },
        { text: '已批准', value: 'approved' },
        { text: '已拒绝', value: 'rejected' },
        { text: '已完成', value: 'completed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      sorter: (a, b) => a.points - b.points,
    },
    {
      title: '参与人数',
      key: 'participants',
      render: (_, record) => (
        <span>{record.currentParticipants}/{record.maxParticipants}</span>
      ),
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
          <Popconfirm
            title="删除活动"
            description="确定要删除这个活动吗？"
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
  
  // 处理添加活动
  const handleAdd = () => {
    message.info('添加活动功能正在开发中...');
  };
  
  // 处理编辑活动
  const handleEdit = (record: Activity) => {
    message.info(`编辑活动: ${record.title}`);
  };
  
  // 处理删除活动
  const handleDelete = (record: Activity) => {
    message.success(`已删除活动：${record.title}`);
    // 实际应用中应该调用API删除数据
  };
  
  // 批量删除
  const handleBatchDelete = () => {
    confirm({
      title: '批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 个活动吗？此操作不可恢复。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        message.success(`已删除 ${selectedRowKeys.length} 个活动`);
        setSelectedRowKeys([]);
        // 实际应用中应该调用API批量删除数据
      },
    });
  };
  
  // 批量批准
  const handleBatchApprove = () => {
    message.success(`已批准 ${selectedRowKeys.length} 个活动`);
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
      <h2>活动管理</h2>
      
      <Card className={styles.searchForm}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="title" label="活动名称">
                <Input placeholder="请输入活动名称" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="organizer" label="组织者">
                <Input placeholder="请输入组织者名称" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="pending">待审批</Option>
                  <Option value="approved">已批准</Option>
                  <Option value="rejected">已拒绝</Option>
                  <Option value="completed">已完成</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item name="dateRange" label="活动时间范围">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item name="pointsRange" label="积分范围">
                <Input.Group compact>
                  <Form.Item name={['pointsRange', 'min']} noStyle>
                    <Input style={{ width: 100, textAlign: 'center' }} placeholder="最小值" />
                  </Form.Item>
                  <Input
                    style={{ width: 30, borderLeft: 0, borderRight: 0, pointerEvents: 'none', backgroundColor: '#fff' }}
                    placeholder="~"
                    disabled
                  />
                  <Form.Item name={['pointsRange', 'max']} noStyle>
                    <Input style={{ width: 100, textAlign: 'center' }} placeholder="最大值" />
                  </Form.Item>
                </Input.Group>
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
          添加活动
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
        />
      </Card>
    </div>
  );
} 