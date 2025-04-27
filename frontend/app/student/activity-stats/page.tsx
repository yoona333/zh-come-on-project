'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, DatePicker, Button, Typography, message } from 'antd';
import { BarChartOutlined, TeamOutlined, CalendarOutlined, TrophyOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import styles from '../../../src/styles/Student.module.scss';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface ActivityStats {
  activities: any[];
  total_activities: number;
  total_participants: number;
  completion_rate: number;
}

// 添加自定义JWT类型
interface CustomJwtPayload {
  userId: number;
  role: number;
  clubId?: number;
  exp: number;
  iat: number;
}

export default function ActivityStats() {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const router = useRouter();

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
      // 使用自定义类型断言
      const decoded = jwtDecode<CustomJwtPayload>(token);
      if (decoded.exp < Date.now() / 1000) {
        message.error('登录已过期，请重新登录');
        router.push('/login');
        return;
      }

      // 检查是否为社长
      if (decoded.role !== 2) {
        message.error('您没有社长权限');
        router.push('/student');
        return;
      }

      fetchActivityStats(token);
    } catch (error) {
      message.error('无效的登录信息，请重新登录');
      router.push('/login');
    }
  };

  const fetchActivityStats = async (token: string) => {
    try {
      setLoading(true);
      let url = 'http://localhost:8080/api/activities/stats';
      
      if (dateRange) {
        url += `?start_date=${dateRange[0]}&end_date=${dateRange[1]}`;
      }
      
      const response = await axios.get(url, {
        headers: { 'x-access-token': token }
      });
      
      setStats(response.data.data);
    } catch (error) {
      console.error('获取活动统计失败:', error);
      message.error('获取活动统计失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      const [start, end] = dates;
      setDateRange([
        start.format('YYYY-MM-DD'),
        end.format('YYYY-MM-DD')
      ]);
    } else {
      setDateRange(null);
    }
  };

  const refreshStats = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchActivityStats(token);
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
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '参与人数',
      dataIndex: 'participant_count',
      key: 'participant_count',
    },
    {
      title: '最大人数',
      dataIndex: 'max_participants',
      key: 'max_participants',
    },
    {
      title: '完成率',
      key: 'completion_rate',
      render: (record: any) => {
        const rate = (record.participant_count / record.max_participants) * 100;
        return `${rate.toFixed(1)}%`;
      }
    }
  ];

  return (
    <div className={styles.container}>
      <Card 
        title={<Title level={4}>活动统计</Title>}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={refreshStats}
          >
            刷新
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="活动总数"
                value={stats?.total_activities || 0}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总参与人次"
                value={stats?.total_participants || 0}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均完成率"
                value={stats?.completion_rate || 0}
                precision={1}
                suffix="%"
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活动积分"
                value={stats?.activities?.reduce((sum, activity) => sum + (activity.points || 0), 0) || 0}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <RangePicker onChange={handleDateRangeChange} />
          <Button 
            type="primary" 
            onClick={refreshStats}
            style={{ marginLeft: 8 }}
          >
            查询
          </Button>
        </div>

        <Table 
          rowKey="id"
          columns={columns} 
          dataSource={stats?.activities || []} 
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "暂无活动数据" }}
        />
      </Card>
    </div>
  );
} 