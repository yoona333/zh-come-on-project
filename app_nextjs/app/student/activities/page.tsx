'use client';

import { useState } from 'react';
import { Card, List, Tag, Button, Input, Select, DatePicker, Row, Col, Badge, Pagination, message, Modal, Divider } from 'antd';
import { SearchOutlined, FilterOutlined, ClockCircleOutlined, EnvironmentOutlined, TrophyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import styles from '../../../src/styles/Activities.module.scss';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ActivitiesList() {
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activities, setActivities] = useState([
    { 
      id: 1, 
      title: '校园歌唱比赛', 
      date: '2023-06-15 19:00', 
      location: '大礼堂', 
      points: 10, 
      tags: ['文艺', '比赛'],
      status: 'upcoming', // upcoming, ongoing, ended
      organizer: '音乐社',
      description: '一年一度的校园歌唱比赛，欢迎所有热爱音乐的同学参加！比赛分为初赛和决赛两个阶段，获奖者将有机会参加校级文艺汇演。',
      requirements: '不限专业，有一定的音乐基础，能够完整演唱一首歌曲。',
      maxParticipants: 100,
      currentParticipants: 45,
      contact: '李老师 (13800138000)'
    },
    { 
      id: 2, 
      title: '志愿者服务日', 
      date: '2023-06-18 09:00', 
      location: '校门口', 
      points: 15, 
      tags: ['志愿者', '服务'],
      status: 'upcoming',
      organizer: '青年志愿者协会',
      description: '为社区提供志愿服务，包括清洁环境、帮助老人等活动。这是一个很好的机会来回馈社会并获得社会实践经验。',
      requirements: '有爱心，有责任心，能够按时参加活动。',
      maxParticipants: 50,
      currentParticipants: 30,
      contact: '王老师 (13900139000)'
    },
    { 
      id: 3, 
      title: '程序设计大赛', 
      date: '2023-06-20 14:00', 
      location: '计算机楼', 
      points: 20, 
      tags: ['科技', '比赛'],
      status: 'upcoming',
      organizer: '计算机协会',
      description: '挑战你的编程技能，与其他编程爱好者一起竞争！比赛将涵盖算法设计、问题解决和创新应用开发。',
      requirements: '有基本的编程基础，熟悉至少一种编程语言。',
      maxParticipants: 80,
      currentParticipants: 60,
      contact: '张教授 (13700137000)'
    },
    { 
      id: 4, 
      title: '篮球友谊赛', 
      date: '2023-06-25 15:00', 
      location: '体育馆', 
      points: 8, 
      tags: ['体育', '比赛'],
      status: 'upcoming',
      organizer: '篮球社',
      description: '不同院系之间的篮球友谊赛，增进院系友谊。比赛采用5v5全场制，每场比赛40分钟。',
      requirements: '有篮球基础，能够参与团队配合。',
      maxParticipants: 60,
      currentParticipants: 40,
      contact: '刘教练 (13600136000)'
    },
    { 
      id: 5, 
      title: '环保讲座', 
      date: '2023-06-30 10:00', 
      location: '图书馆报告厅', 
      points: 5, 
      tags: ['讲座', '环保'],
      status: 'upcoming',
      organizer: '环保社',
      description: '关于环境保护的重要性和日常环保小技巧的讲座。特邀环保专家分享最新的环保理念和实践方法。',
      requirements: '对环保有兴趣，愿意学习和实践环保知识。',
      maxParticipants: 120,
      currentParticipants: 50,
      contact: '赵老师 (13500135000)'
    },
  ]);

  // 处理报名参加按钮点击
  const handleJoinActivity = (activityId: number) => {
    // 检查是否已满
    const activity = activities.find(a => a.id === activityId);
    if (activity && activity.currentParticipants >= activity.maxParticipants) {
      message.error('该活动名额已满，无法报名');
      return;
    }
    
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      message.success(`您已成功报名参加活动: ${activities.find(a => a.id === activityId)?.title}`);
      // 更新活动参与人数
      setActivities(activities.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            currentParticipants: activity.currentParticipants + 1
          };
        }
        return activity;
      }));
      setLoading(false);
    }, 1000);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    if (!value.trim()) {
      message.info('请输入搜索关键词');
      return;
    }
    
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      const filteredActivities = activities.filter(
        activity => activity.title.includes(value) || 
                   activity.description.includes(value) ||
                   activity.organizer.includes(value) ||
                   activity.tags.some(tag => tag.includes(value))
      );
      
      if (filteredActivities.length === 0) {
        message.info('没有找到匹配的活动');
      } else {
        message.success(`找到 ${filteredActivities.length} 个匹配的活动`);
      }
      
      setLoading(false);
    }, 1000);
  };

  // 处理筛选
  const handleFilter = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      message.success('筛选条件已应用');
      setLoading(false);
    }, 1000);
  };
  
  // 查看活动详情
  const showActivityDetail = (activity: any) => {
    setSelectedActivity(activity);
    setDetailModalVisible(true);
  };

  return (
    <div className={styles.activitiesPage}>
      <h2>活动列表</h2>
      
      <Card className={styles.filterCard}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="搜索活动"
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select 
              placeholder="活动类型" 
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="文艺">文艺</Option>
              <Option value="体育">体育</Option>
              <Option value="科技">科技</Option>
              <Option value="志愿者">志愿者</Option>
              <Option value="讲座">讲座</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select 
              placeholder="活动状态" 
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="upcoming">即将开始</Option>
              <Option value="ongoing">进行中</Option>
              <Option value="ended">已结束</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Col>
          <Col xs={24} sm={12} md={24} style={{ textAlign: 'right', marginTop: 16 }}>
            <Button 
              type="primary" 
              icon={<FilterOutlined />} 
              onClick={handleFilter}
              loading={loading}
            >
              应用筛选
            </Button>
          </Col>
        </Row>
      </Card>
      
      <List
        className={styles.activitiesList}
        loading={loading}
        itemLayout="vertical"
        dataSource={activities}
        pagination={{
          onChange: page => {
            window.scrollTo(0, 0);
          },
          pageSize: 5,
          total: activities.length,
          showTotal: total => `共 ${total} 个活动`
        }}
        renderItem={item => (
          <List.Item
            key={item.id}
            actions={[
              <Button 
                type="default" 
                key="detail" 
                icon={<InfoCircleOutlined />}
                onClick={() => showActivityDetail(item)}
              >
                查看详情
              </Button>,
              <Button 
                type="primary" 
                key="join" 
                onClick={() => handleJoinActivity(item.id)}
                disabled={item.currentParticipants >= item.maxParticipants}
              >
                {item.currentParticipants >= item.maxParticipants ? '名额已满' : '报名参加'}
              </Button>
            ]}
            extra={
              <div className={styles.activityMeta}>
                <div className={styles.activityPoints}>
                  <TrophyOutlined /> {item.points} 积分
                </div>
                <div className={styles.activityCapacity}>
                  <Badge 
                    status={
                      item.currentParticipants >= item.maxParticipants 
                        ? 'error' 
                        : item.currentParticipants / item.maxParticipants > 0.7 
                          ? 'warning' 
                          : 'success'
                    } 
                  />
                  {item.currentParticipants}/{item.maxParticipants} 人
                </div>
              </div>
            }
          >
            <List.Item.Meta
              title={
                <div className={styles.activityTitle}>
                  {item.title}
                  {item.status === 'ongoing' && <Tag color="green">进行中</Tag>}
                  {item.status === 'ended' && <Tag color="default">已结束</Tag>}
                </div>
              }
              description={
                <div className={styles.activityInfo}>
                  <p><ClockCircleOutlined /> {item.date}</p>
                  <p><EnvironmentOutlined /> {item.location}</p>
                  <p>主办方: {item.organizer}</p>
                  <div>
                    {item.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              }
            />
            <div className={styles.activityDescription}>
              {item.description.length > 100 
                ? `${item.description.substring(0, 100)}...` 
                : item.description}
            </div>
          </List.Item>
        )}
      />
      
      {/* 活动详情模态框 */}
      <Modal
        title="活动详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="join" 
            type="primary" 
            disabled={selectedActivity?.currentParticipants >= selectedActivity?.maxParticipants}
            onClick={() => {
              handleJoinActivity(selectedActivity?.id);
              setDetailModalVisible(false);
            }}
          >
            {selectedActivity?.currentParticipants >= selectedActivity?.maxParticipants 
              ? '名额已满' 
              : '报名参加'}
          </Button>
        ]}
        width={700}
      >
        {selectedActivity && (
          <div className={styles.activityDetailContent}>
            <h3>{selectedActivity.title}</h3>
            
            <div className={styles.activityDetailMeta}>
              <p><strong>时间:</strong> {selectedActivity.date}</p>
              <p><strong>地点:</strong> {selectedActivity.location}</p>
              <p><strong>主办方:</strong> {selectedActivity.organizer}</p>
              <p><strong>积分:</strong> {selectedActivity.points}</p>
              <p><strong>参与人数:</strong> {selectedActivity.currentParticipants}/{selectedActivity.maxParticipants}</p>
              <p><strong>联系方式:</strong> {selectedActivity.contact}</p>
            </div>
            
            <Divider />
            
            <div className={styles.activityDetailDescription}>
              <h4>活动描述</h4>
              <p>{selectedActivity.description}</p>
            </div>
            
            <div className={styles.activityDetailRequirements}>
              <h4>参与要求</h4>
              <p>{selectedActivity.requirements}</p>
            </div>
            
            <div className={styles.activityDetailTags}>
              <h4>活动标签</h4>
              {selectedActivity.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 