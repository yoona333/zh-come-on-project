'use client';

import { Card, Row, Col, Statistic, List, Tag, Button, message } from 'antd';
import { 
  CalendarOutlined, 
  TeamOutlined, 
  TrophyOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import styles from '../../src/styles/Layout.module.scss';
import { useState } from 'react';

export default function StudentDashboard() {
  // 模拟数据
  const stats = [
    { title: '参与活动', value: 12, icon: <CalendarOutlined /> },
    { title: '获得积分', value: 156, icon: <TrophyOutlined /> },
    { title: '加入社团', value: 3, icon: <TeamOutlined /> },
  ];

  const [upcomingActivities, setUpcomingActivities] = useState([
    { id: 1, title: '校园歌唱比赛', date: '2023-06-15 19:00', location: '大礼堂', points: 10, tags: ['文艺', '比赛'] },
    { id: 2, title: '志愿者服务日', date: '2023-06-18 09:00', location: '校门口', points: 15, tags: ['志愿者', '服务'] },
    { id: 3, title: '程序设计大赛', date: '2023-06-20 14:00', location: '计算机楼', points: 20, tags: ['科技', '比赛'] },
  ]);

  // 处理报名参加按钮点击
  const handleJoinActivity = (activityId: number) => {
    message.success(`您已成功报名参加活动 ID: ${activityId}`);
    // 这里应该有实际的API调用来处理报名逻辑
  };

  // 处理查看更多按钮点击
  const handleViewMore = () => {
    message.info('正在加载更多内容...');
    // 这里应该有实际的API调用来加载更多内容
  };

  return (
    <div className={styles.dashboard}>
      <h2>欢迎回来，张三！</h2>
      
      <Row gutter={16} className={styles.statsRow}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={8} key={index}>
            <Card>
              <Statistic 
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      <Card title="即将开始的活动" extra={<Button type="link" href="/student/activities">查看全部</Button>}>
        <List
          itemLayout="horizontal"
          dataSource={upcomingActivities}
          renderItem={item => (
            <List.Item
              actions={[
                <Button 
                  type="primary" 
                  key="join" 
                  onClick={() => handleJoinActivity(item.id)}
                >
                  报名参加
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={
                  <>
                    <p>
                      <ClockCircleOutlined /> {item.date} | 地点: {item.location} | 积分: {item.points}
                    </p>
                    <div>
                      {item.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
      
      <div className={styles.viewMoreContainer}>
        <Button type="link" onClick={handleViewMore}>查看更多内容</Button>
      </div>
    </div>
  );
} 