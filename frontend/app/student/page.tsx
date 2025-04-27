'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Button, Typography, Spin, message } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, TrophyOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from '../../src/styles/Student.module.scss';

const { Title, Text } = Typography;

interface Activity {
  id: number;
  title: string;
  location: string;
  start_time: string;
  tags: string;
  points: number;
}

interface UserInfo {
  id: number;
  username: string;
  role: number;
  avatar?: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState({
    activitiesCount: 0,
    pointsCount: 0,
    clubsCount: 0
  });

  useEffect(() => {
    const verifyUserAndLoadData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        router.push('/login');
        return;
      }
      
      try {
        // 验证用户身份和角色
        const authResponse = await axios.get('http://localhost:8080/api/user/profile', {
          headers: { 'x-access-token': token }
        });
        
        if (!authResponse.data.success) {
          message.error('会话已过期，请重新登录');
          router.push('/login');
          return;
        }
        
        const userData = authResponse.data.data;
        const actualRole = userData.role.toString();
        
        // 检查是否有权限访问学生页面 (角色为学生或社长)
        if (actualRole !== '1' && actualRole !== '2') {
          message.error('您没有权限访问此页面');
          router.push('/login');
          return;
        }
        
        // 如果存储的角色与实际角色不匹配，更新localStorage
        const storedRole = localStorage.getItem('role');
        if (storedRole !== actualRole) {
          localStorage.setItem('role', actualRole);
        }
        
        // 加载数据
        await Promise.all([
          fetchStats(token),
          fetchUpcomingActivities(token)
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('验证身份失败:', error);
        message.error('验证用户身份失败，请重新登录');
        router.push('/login');
      }
    };
    
    verifyUserAndLoadData();
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      // 获取我参加的活动数量
      const activitiesResponse = await axios.get('http://localhost:8080/api/activities/my', {
        headers: { 'x-access-token': token }
      });
      
      // 获取我的积分总数
      const pointsResponse = await axios.get('http://localhost:8080/api/user/points', {
        headers: { 'x-access-token': token }
      });
      
      // 获取我加入的社团数量
      const clubsResponse = await axios.get('http://localhost:8080/api/user/clubs', {
        headers: { 'x-access-token': token }
      });
      
      setStats({
        activitiesCount: activitiesResponse.data.data?.length || 0,
        pointsCount: pointsResponse.data.total || 0,
        clubsCount: clubsResponse.data.data?.length || 0
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 使用默认值或从localStorage获取
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      setStats({
        activitiesCount: 12, // 示例数据
        pointsCount: userInfo.points || 156, // 示例数据
        clubsCount: 3 // 示例数据
      });
    }
  };

  const fetchUpcomingActivities = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:8080/api/activities', {
        headers: { 'x-access-token': token },
        params: { status: 1, upcoming: true }
      });
      
      if (response.data.success) {
        // 过滤获取未来的活动（开始时间大于当前时间）
        const now = new Date();
        const upcomingActivities = response.data.data.filter((activity: Activity) => 
          new Date(activity.start_time) > now
        ).slice(0, 3); // 只取前3个活动
        
        setActivities(upcomingActivities);
      }
    } catch (error) {
      console.error('获取即将开始的活动失败:', error);
      // 设置一些示例数据
      setActivities([
        {
          id: 1,
          title: '校园歌唱比赛',
          location: '大礼堂',
          start_time: '2023-06-15 19:00:00',
          tags: '文艺,比赛',
          points: 10
        },
        {
          id: 2,
          title: '志愿者服务日',
          location: '校门口',
          start_time: '2023-06-18 09:00:00',
          tags: '志愿者,服务',
          points: 15
        },
        {
          id: 3,
          title: '程序设计大赛',
          location: '计算机楼',
          start_time: '2023-06-20 14:00:00',
          tags: '科技,比赛',
          points: 20
        }
      ]);
    }
  };

  const handleActivitySignup = async (activityId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        return;
      }
      
      const response = await axios.post(`http://localhost:8080/api/activities/${activityId}/signup`, {}, {
        headers: { 'x-access-token': token }
      });
      
      if (response.data.success) {
        message.success('报名成功');
        // 可以在这里更新活动状态
      }
    } catch (error: any) {
      console.error('报名失败:', error);
      message.error(error.response?.data?.message || '报名失败，请稍后再试');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Title level={4} className={styles.welcome}>
        欢迎回来，{userInfo?.username || '同学'}！
      </Title>
      
      <Row gutter={16} className={styles.statsRow}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic 
              title="参与活动" 
              value={stats.activitiesCount} 
              prefix={<CalendarOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic 
              title="获得积分" 
              value={stats.pointsCount} 
              prefix={<TrophyOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic 
              title="加入社团" 
              value={stats.clubsCount} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      <div className={styles.sectionHeader}>
        <Title level={5}>即将开始的活动</Title>
        <Link href="/student/activities">
          <Button type="link">查看全部</Button>
        </Link>
      </div>
      
      <List
        itemLayout="horizontal"
        dataSource={activities}
        renderItem={(activity) => (
          <List.Item
            actions={[
              <Button 
                key="signup" 
                type="primary" 
                onClick={() => handleActivitySignup(activity.id)}
              >
                报名参加
              </Button>
            ]}
          >
            <List.Item.Meta
              title={<Link href={`/student/activities/${activity.id}`}>{activity.title}</Link>}
              description={
                <div>
                  <p>
                    <ClockCircleOutlined style={{ marginRight: 8 }} /> 
                    {new Date(activity.start_time).toLocaleString()}
                  </p>
                  <p>
                    <EnvironmentOutlined style={{ marginRight: 8 }} /> 
                    {activity.location}
                  </p>
                  <p>
                    <TrophyOutlined style={{ marginRight: 8 }} /> 
                    积分: {activity.points}
                  </p>
                  <div>
                    {activity.tags.split(',').map((tag: string) => (
                      <Tag key={tag} color="blue">{tag}</Tag>
                    ))}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      
      <div className={styles.moreContent}>
        <Link href="/student/activities">
          <Button type="default" block>查看更多内容</Button>
        </Link>
      </div>

      <div style={{ marginBottom: '20px', padding: '8px 12px', backgroundColor: '#f6f6f6', borderRadius: '4px' }}>
        <p style={{ color: '#666', margin: 0 }}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          学号、年级、班级、学院、专业等信息不可修改，如需更改请联系管理员
        </p>
      </div>
    </div>
  );
}