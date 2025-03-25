'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Typography, Spin, Button, Progress, Table } from 'antd';
import { 
  TeamOutlined, 
  CalendarOutlined, 
  TrophyOutlined, 
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import styles from '@/styles/Dashboard.module.scss';

const { Title } = Typography;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  
  useEffect(() => {
    // 模拟获取数据
    setTimeout(() => {
      setStats({
        totalStudents: 1250,
        totalActivities: 48,
        totalClubs: 25,
        totalPoints: 12580,
        pendingActivitiesCount: 5
      });
      
      setPendingActivities([
        { 
          id: 1, 
          title: '校园歌唱比赛', 
          club: '音乐协会',
          date: '2023-11-20',
          submittedBy: '李四',
          submittedAt: '2023-11-05'
        },
        { 
          id: 2, 
          title: '篮球友谊赛', 
          club: '篮球社',
          date: '2023-11-25',
          submittedBy: '王五',
          submittedAt: '2023-11-06'
        },
        { 
          id: 3, 
          title: '编程竞赛', 
          club: '计算机协会',
          date: '2023-12-01',
          submittedBy: '张三',
          submittedAt: '2023-11-07'
        },
      ]);
      
      setTopStudents([
        { key: '1', rank: 1, name: '李明', studentId: '2020123001', points: 320, activities: 15 },
        { key: '2', rank: 2, name: '王芳', studentId: '2020123002', points: 290, activities: 14 },
        { key: '3', rank: 3, name: '张伟', studentId: '2020123003', points: 275, activities: 12 },
        { key: '4', rank: 4, name: '刘洋', studentId: '2020123004', points: 260, activities: 13 },
        { key: '5', rank: 5, name: '陈晨', studentId: '2020123005', points: 245, activities: 11 },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);
  
  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <div className={styles.rankCell}>
          {rank <= 3 ? (
            <div className={`${styles.rankBadge} ${styles[`rank${rank}`]}`}>{rank}</div>
          ) : (
            <div>{rank}</div>
          )}
        </div>
      )
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (points: number) => (
        <div className={styles.pointsCell}>
          <span className={styles.pointsValue}>{points}</span>
          <Progress 
            percent={points / 4} 
            showInfo={false} 
            strokeColor="#1890ff" 
            className={styles.pointsProgress}
          />
        </div>
      )
    },
    {
      title: '参与活动',
      dataIndex: 'activities',
      key: 'activities',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <a href={`/admin/students/${record.studentId}`}>查看详情</a>
      ),
    },
  ];
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <div className={styles.dashboard}>
      <Title level={4} className={styles.welcomeTitle}>
        管理员控制台
      </Title>
      
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="学生总数" 
              value={stats.totalStudents} 
              prefix={<UserOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="活动总数" 
              value={stats.totalActivities} 
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="社团总数" 
              value={stats.totalClubs} 
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic 
              title="积分发放总量" 
              value={stats.totalPoints} 
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className={styles.contentRow}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className={styles.cardTitleWithBadge}>
                待审核活动
                <Tag color="red">{stats.pendingActivitiesCount}</Tag>
              </div>
            } 
            className={styles.pendingCard}
            extra={<a href="/admin/activities/pending">查看全部</a>}
          >
            <List
              dataSource={pendingActivities}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button key="approve" type="primary" size="small" icon={<CheckCircleOutlined />}>
                      审核
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <div>
                        <div><TeamOutlined /> {item.club}</div>
                        <div><ClockCircleOutlined /> 活动日期: {item.date}</div>
                        <div>提交人: {item.submittedBy} | 提交时间: {item.submittedAt}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title="积分排行榜" 
            className={styles.rankingCard}
            extra={<a href="/admin/rankings">查看全部</a>}
          >
            <Table 
              columns={columns} 
              dataSource={topStudents}
              pagination={false}
              className={styles.rankingTable}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className={styles.actionRow}>
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable 
            className={styles.actionCard}
            onClick={() => window.location.href = '/admin/manage-students'}
          >
            <div className={styles.actionContent}>
              <UserOutlined className={styles.actionIcon} />
              <div className={styles.actionTitle}>学生管理</div>
              <div className={styles.actionDesc}>管理学生账号、查看学生信息</div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable 
            className={styles.actionCard}
            onClick={() => window.location.href = '/admin/manage-clubs'}
          >
            <div className={styles.actionContent}>
              <TeamOutlined className={styles.actionIcon} />
              <div className={styles.actionTitle}>社团管理</div>
              <div className={styles.actionDesc}>管理社团信息、分配社长权限</div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable 
            className={styles.actionCard}
            onClick={() => window.location.href = '/admin/manage-activities'}
          >
            <div className={styles.actionContent}>
              <AppstoreOutlined className={styles.actionIcon} />
              <div className={styles.actionTitle}>活动管理</div>
              <div className={styles.actionDesc}>管理活动、审核活动申请</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
} 