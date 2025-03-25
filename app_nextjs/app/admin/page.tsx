'use client';

import { Card, Row, Col, Statistic, List, Tag, Button, Progress, message } from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  TeamOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import styles from '../../src/styles/Layout.module.scss';
import { useState } from 'react';

export default function AdminDashboard() {
  // 模拟数据
  const stats = [
    { title: '注册学生', value: 1256, icon: <UserOutlined /> },
    { title: '活动总数', value: 78, icon: <CalendarOutlined /> },
    { title: '社团总数', value: 32, icon: <TeamOutlined /> },
  ];

  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 1, title: '校园歌唱比赛', organizer: '音乐社', date: '2023-06-15 19:00', status: '待审批' },
    { id: 2, title: '志愿者服务日', organizer: '青年志愿者协会', date: '2023-06-18 09:00', status: '待审批' },
    { id: 3, title: '程序设计大赛', organizer: '计算机协会', date: '2023-06-20 14:00', status: '待审批' },
  ]);

  // 处理批准活动按钮点击
  const handleApproveActivity = (activityId: number) => {
    message.success(`已批准活动 ID: ${activityId}`);
    // 从列表中移除已批准的活动
    setPendingApprovals(pendingApprovals.filter(item => item.id !== activityId));
    // 这里应该有实际的API调用来处理批准逻辑
  };

  // 处理拒绝活动按钮点击
  const handleRejectActivity = (activityId: number) => {
    message.error(`已拒绝活动 ID: ${activityId}`);
    // 从列表中移除已拒绝的活动
    setPendingApprovals(pendingApprovals.filter(item => item.id !== activityId));
    // 这里应该有实际的API调用来处理拒绝逻辑
  };

  // 处理查看系统日志按钮点击
  const handleViewLogs = () => {
    message.info('正在加载系统日志...');
    // 这里应该有实际的API调用来加载系统日志
  };

  return (
    <div className={styles.dashboard}>
      <h2>管理员控制台</h2>
      
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
      
      <Row gutter={16} className={styles.statsRow}>
        <Col span={12}>
          <Card title="系统状态">
            <p>服务器状态: <Tag color="success">正常</Tag></p>
            <p>数据库状态: <Tag color="success">正常</Tag></p>
            <p>系统负载: <Progress percent={35} status="active" /></p>
            <p>存储空间: <Progress percent={62} status="active" /></p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="待审批活动" extra={<Button type="link" href="/admin/manage-activities">查看全部</Button>}>
            <List
              itemLayout="horizontal"
              dataSource={pendingApprovals}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      type="primary" 
                      size="small" 
                      key="approve"
                      onClick={() => handleApproveActivity(item.id)}
                    >
                      批准
                    </Button>,
                    <Button 
                      danger 
                      size="small" 
                      key="reject"
                      onClick={() => handleRejectActivity(item.id)}
                    >
                      拒绝
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <>
                        <p>
                          组织者: {item.organizer} | <ClockCircleOutlined /> {item.date}
                        </p>
                        <Tag color="warning">{item.status}</Tag>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      
      <div className={styles.viewMoreContainer}>
        <Button type="link" onClick={handleViewLogs}>查看系统日志</Button>
      </div>
    </div>
  );
} 