'use client';

import { Card, Table, Tag, Button, Input, message, Modal, Row, Col, Select, Space, Badge } from 'antd';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { SearchOutlined, CalendarOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

interface Activity {
  id: number;
  title: string;
  description: string;
  club_name: string;
  club_id: number;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  participant_count: number;
  status: number;
  is_signed_up?: boolean;
}

export default function StudentActivities() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityDetail, setActivityDetail] = useState<Activity | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [signUpLoading, setSignUpLoading] = useState(false);

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
      const decoded = jwtDecode(token);
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        message.error('登录已过期，请重新登录');
        router.push('/login');
        return;
      }

      fetchActivities(token);
    } catch (error) {
      message.error('无效的登录信息，请重新登录');
      router.push('/login');
    }
  };

  const fetchActivities = async (token: string) => {
    try {
      setLoading(true);
      let url = 'http://localhost:8080/api/activities';
      
      // 添加状态过滤
      if (statusFilter !== null) {
        url += `?status=${statusFilter}`;
      }
      
      const response = await axios.get(url, {
        headers: { 'x-access-token': token }
      });

      if (response.data.success) {
        const activitiesData = response.data.data;
        
        // 获取用户已报名的活动
        const signupsResponse = await axios.get('http://localhost:8080/api/activities/signups', {
          headers: { 'x-access-token': token }
        });
        
        const signedUpActivityIds = signupsResponse.data.success ? 
          signupsResponse.data.data.map((signup: any) => signup.activity_id) : [];
        
        // 标记用户已报名的活动
        const activitiesWithSignup = activitiesData.map((activity: Activity) => ({
          ...activity,
          is_signed_up: signedUpActivityIds.includes(activity.id)
        }));
        
        setActivities(activitiesWithSignup);
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
      message.error('获取活动列表失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchActivities(token);
    }
  };

  const showActivityDetail = (activity: Activity) => {
    setActivityDetail(activity);
    setDetailModalVisible(true);
  };

  const handleSignUp = async (activityId: number) => {
    try {
      setSignUpLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/activities/${activityId}/signup`,
        {},
        { headers: { 'x-access-token': token } }
      );
      
      if (response.data.success) {
        message.success('报名成功');
        // 刷新活动列表
        fetchActivities(token!);
        // 如果在详情页报名，关闭详情页
        setDetailModalVisible(false);
      }
    } catch (error: any) {
      console.error('报名失败:', error);
      if (error.response && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('报名失败，请稍后再试');
      }
    } finally {
      setSignUpLoading(false);
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="warning">待审批</Tag>;
      case 1:
        return <Tag color="success">已通过</Tag>;
      case 2:
        return <Tag color="error">已拒绝</Tag>;
      case 3:
        return <Tag color="processing">已完成</Tag>;
      case 4:
        return <Tag color="default">已取消</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };

  // 过滤活动列表
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchText.toLowerCase()) ||
      activity.club_name.toLowerCase().includes(searchText.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === null || activity.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Activity) => (
        <Space>
          {record.is_signed_up && <Badge status="success" />}
          {text}
        </Space>
      ),
    },
    {
      title: '社团',
      dataIndex: 'club_name',
      key: 'club_name',
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (text: string) => new Date(text).toLocaleString(),
      sorter: (a: Activity, b: Activity) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '参与人数',
      key: 'participants',
      render: (record: Activity) => `${record.participant_count}/${record.max_participants}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Activity) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => showActivityDetail(record)}
          >
            详情
          </Button>
          {record.status === 1 && !record.is_signed_up && (
            <Button 
              type="link" 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleSignUp(record.id)}
              disabled={record.participant_count >= record.max_participants}
            >
              报名
            </Button>
          )}
          {record.is_signed_up && (
            <Tag color="success">已报名</Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="活动列表" 
        extra={
          <Space>
            <Input
              placeholder="搜索活动名称/社团/地点"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 220 }}
            />
            <Select
              placeholder="活动状态"
              style={{ width: 120 }}
              allowClear
              value={statusFilter}
              onChange={value => setStatusFilter(value)}
            >
              <Option value={1}>已通过</Option>
              <Option value={3}>已完成</Option>
              <Option value={4}>已取消</Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>查询</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredActivities}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 活动详情弹窗 */}
      <Modal
        title={activityDetail?.title}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          activityDetail?.status === 1 && !activityDetail?.is_signed_up && activityDetail?.participant_count < activityDetail?.max_participants && (
            <Button 
              key="submit" 
              type="primary" 
              loading={signUpLoading}
              onClick={() => handleSignUp(activityDetail.id)}
            >
              报名参加
            </Button>
          )
        ]}
        width={700}
      >
        {activityDetail && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <h3>活动详情</h3>
                <p>{activityDetail.description}</p>
              </Col>
              <Col span={12}>
                <p><strong>举办社团：</strong>{activityDetail.club_name}</p>
                <p><strong>活动地点：</strong>{activityDetail.location}</p>
                <p><strong>活动状态：</strong>{getStatusTag(activityDetail.status)}</p>
              </Col>
              <Col span={12}>
                <p><strong>开始时间：</strong>{new Date(activityDetail.start_time).toLocaleString()}</p>
                <p><strong>结束时间：</strong>{new Date(activityDetail.end_time).toLocaleString()}</p>
                <p><strong>参与人数：</strong>{activityDetail.participant_count}/{activityDetail.max_participants}</p>
              </Col>
              {activityDetail.is_signed_up && (
                <Col span={24}>
                  <Tag color="success" style={{padding: '5px 10px', fontSize: '14px'}}>您已成功报名此活动</Tag>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}