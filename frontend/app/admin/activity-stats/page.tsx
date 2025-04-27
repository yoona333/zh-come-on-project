'use client';

import { Card, Table, DatePicker, Button, message, Row, Col, Statistic, Select, Space } from 'antd';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { CalendarOutlined, TeamOutlined, RiseOutlined, BarChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface CustomJwtPayload {
  exp?: number;
  role: number;
  userId: number;
}

interface ActivityStat {
  id: number;
  title: string;
  club_name: string;
  participant_count: number;
  max_participants: number;
  start_time: string;
  end_time: string;
  status: number;
}

export default function ActivityStats() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activityStats, setActivityStats] = useState<ActivityStat[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [totalActivities, setTotalActivities] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

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
      const decoded = jwtDecode<CustomJwtPayload>(token);
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        message.error('登录已过期，请重新登录');
        router.push('/login');
        return;
      }

      // 只有管理员可以访问
      const role = decoded.role;
      if (role !== 0) {
        message.error('您没有管理员权限');
        router.push('/login');
        return;
      }

      fetchData(token);
    } catch (error) {
      message.error('无效的登录信息，请重新登录');
      router.push('/login');
    }
  };

  const fetchData = async (token: string) => {
    try {
      setLoading(true);
      let url = 'http://localhost:8080/api/activities/stats';
      
      // 构建查询参数
      const params: any = {};
      if (dateRange) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      if (statusFilter !== null) {
        params.status = statusFilter;
      }
      
      const response = await axios.get(url, {
        headers: { 'x-access-token': token },
        params
      });

      if (response.data.success) {
        const stats = response.data.data;
        setActivityStats(stats.activities);
        setTotalActivities(stats.total_activities);
        setTotalParticipants(stats.total_participants);
        setCompletionRate(stats.completion_rate);
      }
    } catch (error) {
      console.error('获取活动统计数据失败:', error);
      message.error('获取活动统计数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchData(token);
    }
  };

  const handleReset = () => {
    setDateRange(null);
    setStatusFilter(null);
    const token = localStorage.getItem('token');
    if (token) {
      fetchData(token);
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return '待审批';
      case 1:
        return '已通过';
      case 2:
        return '已拒绝';
      case 3:
        return '已完成';
      case 4:
        return '已取消';
      default:
        return '未知';
    }
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '社团',
      dataIndex: 'club_name',
      key: 'club_name',
    },
    {
      title: '参与人数',
      dataIndex: 'participant_count',
      key: 'participant_count',
      render: (count: number, record: ActivityStat) => `${count}/${record.max_participants}`,
      sorter: (a: ActivityStat, b: ActivityStat) => a.participant_count - b.participant_count,
    },
    {
      title: '参与率',
      key: 'participation_rate',
      render: (_: any, record: ActivityStat) => 
        `${Math.round((record.participant_count / record.max_participants) * 100)}%`,
      sorter: (a: ActivityStat, b: ActivityStat) => 
        (a.participant_count / a.max_participants) - (b.participant_count / b.max_participants),
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (text: string) => new Date(text).toLocaleString(),
      sorter: (a: ActivityStat, b: ActivityStat) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => getStatusTag(status),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="活动总数"
              value={totalActivities}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总参与人次"
              value={totalParticipants}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="平均完成率"
              value={completionRate}
              precision={2}
              suffix="%"
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="活动统计"
        extra={
          <Space>
            <RangePicker 
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            />
            <Select
              placeholder="活动状态"
              style={{ width: 120 }}
              allowClear
              value={statusFilter}
              onChange={value => setStatusFilter(value)}
            >
              <Option value={0}>待审批</Option>
              <Option value={1}>已通过</Option>
              <Option value={2}>已拒绝</Option>
              <Option value={3}>已完成</Option>
              <Option value={4}>已取消</Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={activityStats}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
} 