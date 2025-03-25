'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Typography, Spin, Empty } from 'antd';
import { 
  TrophyOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  RiseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import Layout from '@/components/ui/Layout';
import styles from '@/styles/Dashboard.module.scss';

const { Title, Text } = Typography;

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isClubLeader, setIsClubLeader] = useState(false);
  
  useEffect(() => {
    // 模拟获取用户数据
    setTimeout(() => {
      setUserData({
        name: '张三',
        studentId: '2020123456',
        totalPoints: 120,
        rank: 15,
        attendedActivities: 8,
        clubName: '计算机协会'
      });
      
      setActivities([
        { 
          id: 1, 
          title: '校园歌唱比赛', 
          date: '2023-11-15', 
          status: 'upcoming',
          points: 10,
          location: '大学生活动中心'
        },
        { 
          id: 2, 
          title: '编程马拉松', 
          date: '2023-11-10', 
          status: 'completed',
          points: 15,
          location: '计算机学院实验室'
        },
        { 
          id: 3, 
          title: '志愿者服务日', 
          date: '2023-11-05', 
          status: 'completed',
          points: 8,
          location: '校园广场'
        },
      ]);
      
      // 假设从cookie或其他地方获取是否为社长
      setIsClubLeader(true);
      
      setLoading(false);
    }, 1000);
  }, []);
  
  if (loading) {
    return (
      <Layout role="student" userName="加载中...">
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout role="student" userName={userData.name}>
      <div className={styles.dashboard}>
        <Title level={4} className={styles.welcomeTitle}>
          欢迎回来，{userData.name}
          {isClubLeader && <Tag color="gold" className={styles.leaderTag}>社长</Tag>}
        </Title>
        
        <Row gutter={[16, 16]} className={styles.statsRow}>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCard}>
              <Statistic 
                title="我的积分" 
                value={userData.totalPoints} 
                prefix={<TrophyOutlined />} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCard}>
              <Statistic 
                title="积分排名" 
                value={userData.rank} 
                prefix={<RiseOutlined />}
                suffix={`/ 100`}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCard}>
              <Statistic 
                title="参与活动" 
                value={userData.attendedActivities} 
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCard}>
              <Statistic 
                title="所属社团" 
                value={userData.clubName} 
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Card 
          title="近期活动" 
          className={styles.activitiesCard}
          extra={<a href="/student/activities">查看全部</a>}
        >
          {activities.length > 0 ? (
            <List
              dataSource={activities}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <a key="view" href={`/student/activities/${item.id}`}>查看详情</a>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div>
                        {item.title}
                        {item.status === 'upcoming' && (
                          <Tag color="blue" className={styles.activityTag}>即将开始</Tag>
                        )}
                        {item.status === 'completed' && (
                          <Tag color="green" className={styles.activityTag}>已完成</Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div><ClockCircleOutlined /> {item.date}</div>
                        <div>地点: {item.location}</div>
                        <div>积分: {item.points}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无活动" />
          )}
        </Card>
        
        {isClubLeader && (
          <Card 
            title="社长功能" 
            className={styles.leaderCard}
            extra={<a href="/student/club-management">管理社团</a>}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card 
                  hoverable 
                  className={styles.leaderActionCard}
                  onClick={() => window.location.href = '/student/create-activity'}
                >
                  <div className={styles.leaderActionContent}>
                    <CalendarOutlined className={styles.leaderActionIcon} />
                    <div>创建活动</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card 
                  hoverable 
                  className={styles.leaderActionCard}
                  onClick={() => window.location.href = '/student/manage-members'}
                >
                  <div className={styles.leaderActionContent}>
                    <TeamOutlined className={styles.leaderActionIcon} />
                    <div>管理成员</div>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card 
                  hoverable 
                  className={styles.leaderActionCard}
                  onClick={() => window.location.href = '/student/activity-stats'}
                >
                  <div className={styles.leaderActionContent}>
                    <RiseOutlined className={styles.leaderActionIcon} />
                    <div>活动统计</div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </Layout>
  );
} 