'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Progress, Divider, DatePicker, Button, Empty, Modal, message } from 'antd';
import { TrophyOutlined, RiseOutlined, HistoryOutlined, CalendarOutlined, GiftOutlined } from '@ant-design/icons';
import styles from '../../../src/styles/Points.module.scss';

const { RangePicker } = DatePicker;

export default function PointsPage() {
  const [loading, setLoading] = useState(true);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  // 模拟数据
  const pointsData = {
    total: 156,
    rank: 42,
    totalStudents: 1256,
    percentile: 96.7,
    thisMonth: 35,
    lastMonth: 28,
    growth: 25,
    target: 200,
    progress: 78,
  };
  
  const [pointsHistory, setPointsHistory] = useState([
    { id: 1, activity: '校园马拉松', date: '2023-05-20', points: 20, type: 'earned' },
    { id: 2, activity: '编程工作坊', date: '2023-05-15', points: 12, type: 'earned' },
    { id: 3, activity: '志愿者服务日', date: '2023-04-28', points: 15, type: 'earned' },
    { id: 4, activity: '环保讲座', date: '2023-04-20', points: 5, type: 'earned' },
    { id: 5, activity: '校园歌唱比赛', date: '2023-04-10', points: 10, type: 'earned' },
    { id: 6, activity: '兑换礼品', date: '2023-04-05', points: -30, type: 'spent' },
    { id: 7, activity: '篮球友谊赛', date: '2023-03-25', points: 8, type: 'earned' },
    { id: 8, activity: '志愿者服务日', date: '2023-03-18', points: 15, type: 'earned' },
  ]);
  
  const [redeemOptions, setRedeemOptions] = useState([
    { id: 1, name: '校园书店优惠券', points: 50, description: '可在校园书店使用的10元优惠券', stock: 100 },
    { id: 2, name: '食堂餐券', points: 30, description: '价值15元的食堂餐券', stock: 200 },
    { id: 3, name: '定制T恤', points: 100, description: '学校logo定制T恤一件', stock: 50 },
    { id: 4, name: '电影票', points: 80, description: '校园电影院电影票一张', stock: 30 },
  ]);
  
  // 模拟加载数据
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
  // 处理日期范围变化
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setLoading(true);
      // 模拟API调用
      setTimeout(() => {
        message.success('已更新积分历史记录');
        setLoading(false);
      }, 1000);
    }
  };
  
  // 处理兑换
  const handleRedeem = (option: any) => {
    if (pointsData.total < option.points) {
      message.error('积分不足，无法兑换');
      return;
    }
    
    setSelectedReward(option);
    setRedeemModalVisible(true);
  };
  
  // 确认兑换
  const confirmRedeem = () => {
    setConfirmLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
      // 更新积分历史
      const newRecord = {
        id: Date.now(),
        activity: `兑换${selectedReward.name}`,
        date: new Date().toISOString().split('T')[0],
        points: -selectedReward.points,
        type: 'spent'
      };
      
      setPointsHistory([newRecord, ...pointsHistory]);
      
      // 更新库存
      setRedeemOptions(redeemOptions.map(option => {
        if (option.id === selectedReward.id) {
          return { ...option, stock: option.stock - 1 };
        }
        return option;
      }));
      
      message.success(`成功兑换 ${selectedReward.name}`);
      setRedeemModalVisible(false);
      setConfirmLoading(false);
    }, 1500);
  };
  
  return (
    <div className={styles.pointsPage}>
      <h2>我的积分</h2>
      
      <Row gutter={16} className={styles.statsRow}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic 
              title="总积分" 
              value={pointsData.total} 
              prefix={<TrophyOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic 
              title="排名" 
              value={pointsData.rank} 
              suffix={`/ ${pointsData.totalStudents}`}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className={styles.percentile}>
              超过了 {pointsData.percentile}% 的同学
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic 
              title="本月获得" 
              value={pointsData.thisMonth} 
              valueStyle={{ color: '#722ed1' }}
            />
            <div className={styles.monthGrowth}>
              <RiseOutlined /> 比上月增长 {pointsData.growth}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic 
              title="目标进度" 
              value={pointsData.progress} 
              suffix="%" 
              valueStyle={{ color: '#fa8c16' }}
            />
            <Progress 
              percent={pointsData.progress} 
              showInfo={false} 
              status="active" 
              strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} className={styles.contentRow}>
        <Col xs={24} md={16}>
          <Card 
            title={
              <div className={styles.historyTitle}>
                <span><HistoryOutlined /> 积分历史</span>
                <RangePicker 
                  style={{ marginLeft: 16 }} 
                  onChange={handleDateRangeChange}
                />
              </div>
            }
            className={styles.historyCard}
            loading={loading}
          >
            {pointsHistory.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={pointsHistory}
                renderItem={item => (
                  <List.Item
                    extra={
                      <span className={item.type === 'earned' ? styles.pointsEarned : styles.pointsSpent}>
                        {item.type === 'earned' ? '+' : ''}{item.points}
                      </span>
                    }
                  >
                    <List.Item.Meta
                      title={item.activity}
                      description={
                        <div>
                          <CalendarOutlined /> {item.date}
                          <Tag 
                            color={item.type === 'earned' ? 'green' : 'red'} 
                            style={{ marginLeft: 8 }}
                          >
                            {item.type === 'earned' ? '获得' : '支出'}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无积分历史记录" />
            )}
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card title="积分兑换" className={styles.redeemCard} loading={loading}>
            {redeemOptions.map(option => (
              <Card.Grid key={option.id} className={styles.redeemOption}>
                <div className={styles.redeemName}>{option.name}</div>
                <div className={styles.redeemPoints}>{option.points} 积分</div>
                <div className={styles.redeemDescription}>
                  {option.description}
                  <div className={styles.redeemStock}>库存: {option.stock}</div>
                </div>
                <Button 
                  type="primary" 
                  disabled={pointsData.total < option.points || option.stock <= 0}
                  onClick={() => handleRedeem(option)}
                  icon={<GiftOutlined />}
                  block
                >
                  {option.stock <= 0 ? '已售罄' : '立即兑换'}
                </Button>
              </Card.Grid>
            ))}
          </Card>
        </Col>
      </Row>
      
      <Modal
        title="确认兑换"
        open={redeemModalVisible}
        onOk={confirmRedeem}
        confirmLoading={confirmLoading}
        onCancel={() => setRedeemModalVisible(false)}
      >
        {selectedReward && (
          <>
            <p>您确定要兑换以下奖品吗？</p>
            <Card>
              <p><strong>{selectedReward.name}</strong></p>
              <p>{selectedReward.description}</p>
              <p>所需积分: <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{selectedReward.points}</span></p>
              <p>兑换后剩余积分: <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{pointsData.total - selectedReward.points}</span></p>
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
} 