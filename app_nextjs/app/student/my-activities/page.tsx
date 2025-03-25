'use client';

import { useState } from 'react';
import { Tabs, List, Tag, Button, Card, Badge, Empty, message, Modal, Form, Input, Rate } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, CheckCircleOutlined, CloseCircleOutlined, StarOutlined } from '@ant-design/icons';
import styles from '../../../src/styles/MyActivities.module.scss';

const { TabPane } = Tabs;
const { TextArea } = Input;

export default function MyActivities() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('registered');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const [registeredActivities, setRegisteredActivities] = useState([
    { 
      id: 1, 
      title: '校园歌唱比赛', 
      date: '2023-06-15 19:00', 
      location: '大礼堂', 
      points: 10, 
      tags: ['文艺', '比赛'],
      status: 'upcoming', // upcoming, ongoing, ended
      organizer: '音乐社',
      registrationDate: '2023-06-01 10:30',
      description: '一年一度的校园歌唱比赛，欢迎所有热爱音乐的同学参加！',
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
      registrationDate: '2023-06-02 14:20',
      description: '为社区提供志愿服务，包括清洁环境、帮助老人等活动。',
      contact: '王老师 (13900139000)'
    },
  ]);

  const [completedActivities, setCompletedActivities] = useState([
    { 
      id: 3, 
      title: '校园马拉松', 
      date: '2023-05-20 08:00', 
      location: '校园环道', 
      points: 20, 
      tags: ['体育', '比赛'],
      status: 'ended',
      organizer: '体育部',
      completionDate: '2023-05-20 11:30',
      feedback: '很好的活动，锻炼了身体，也认识了新朋友。',
      rating: 4,
      description: '校园环道5公里跑步活动，促进校园体育文化。',
      contact: '刘教练 (13600136000)'
    },
    { 
      id: 4, 
      title: '编程工作坊', 
      date: '2023-05-15 14:00', 
      location: '计算机楼', 
      points: 12, 
      tags: ['科技', '工作坊'],
      status: 'ended',
      organizer: '计算机协会',
      completionDate: '2023-05-15 17:00',
      feedback: '学到了很多新知识，希望以后能有更多类似的活动。',
      rating: 5,
      description: '学习基础编程知识，实践简单的编程项目。',
      contact: '张教授 (13700137000)'
    },
  ]);

  // 处理取消报名
  const handleCancelRegistration = (activityId: number) => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setRegisteredActivities(registeredActivities.filter(activity => activity.id !== activityId));
      message.success('已取消报名');
      setLoading(false);
    }, 1000);
  };

  // 处理查看活动详情
  const showDetailModal = (activity: any) => {
    setSelectedActivity(activity);
    setIsDetailModalVisible(true);
  };

  // 处理提交反馈
  const showFeedbackModal = (activity: any) => {
    setSelectedActivity(activity);
    form.setFieldsValue({
      feedback: activity.feedback || '',
      rating: activity.rating || 3
    });
    setIsFeedbackModalVisible(true);
  };

  // 提交反馈
  const handleSubmitFeedback = () => {
    form.validateFields().then(values => {
      setLoading(true);
      // 模拟API调用
      setTimeout(() => {
        // 更新本地数据
        setCompletedActivities(completedActivities.map(activity => {
          if (activity.id === selectedActivity.id) {
            return {
              ...activity,
              feedback: values.feedback,
              rating: values.rating
            };
          }
          return activity;
        }));
        
        message.success('反馈已提交，谢谢您的参与！');
        setIsFeedbackModalVisible(false);
        setLoading(false);
      }, 1000);
    });
  };

  return (
    <div className={styles.myActivitiesPage}>
      <h2>我的活动</h2>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className={styles.activitiesTabs}
      >
        <TabPane tab="已报名活动" key="registered">
          {registeredActivities.length > 0 ? (
            <List
              className={styles.activitiesList}
              loading={loading}
              itemLayout="vertical"
              dataSource={registeredActivities}
              renderItem={item => (
                <Card className={styles.activityCard} key={item.id}>
                  <List.Item
                    actions={[
                      <Button 
                        type="primary" 
                        key="detail" 
                        onClick={() => showDetailModal(item)}
                      >
                        查看详情
                      </Button>,
                      <Button 
                        danger 
                        key="cancel" 
                        onClick={() => handleCancelRegistration(item.id)}
                      >
                        取消报名
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className={styles.activityTitle}>
                          {item.title}
                          {item.status === 'ongoing' && <Tag color="green">进行中</Tag>}
                          {item.status === 'upcoming' && <Tag color="blue">即将开始</Tag>}
                        </div>
                      }
                      description={
                        <div className={styles.activityInfo}>
                          <p><ClockCircleOutlined /> {item.date}</p>
                          <p><EnvironmentOutlined /> {item.location}</p>
                          <p>主办方: {item.organizer}</p>
                          <p>报名时间: {item.registrationDate}</p>
                          <div>
                            {item.tags.map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                </Card>
              )}
            />
          ) : (
            <Empty description="您还没有报名任何活动" />
          )}
        </TabPane>
        
        <TabPane tab="已完成活动" key="completed">
          {completedActivities.length > 0 ? (
            <List
              className={styles.activitiesList}
              loading={loading}
              itemLayout="vertical"
              dataSource={completedActivities}
              renderItem={item => (
                <Card className={styles.activityCard} key={item.id}>
                  <List.Item
                    actions={[
                      <Button 
                        type="primary" 
                        key="detail" 
                        onClick={() => showDetailModal(item)}
                      >
                        查看详情
                      </Button>,
                      <Button 
                        type="default" 
                        key="feedback" 
                        onClick={() => showFeedbackModal(item)}
                      >
                        {item.feedback ? '修改反馈' : '提交反馈'}
                      </Button>
                    ]}
                    extra={
                      <div className={styles.activityBadge}>
                        <Badge 
                          count={`+${item.points}`} 
                          style={{ backgroundColor: '#52c41a' }} 
                        />
                      </div>
                    }
                  >
                    <List.Item.Meta
                      title={
                        <div className={styles.activityTitle}>
                          {item.title}
                          <Tag color="default">已完成</Tag>
                        </div>
                      }
                      description={
                        <div className={styles.activityInfo}>
                          <p><ClockCircleOutlined /> {item.date}</p>
                          <p><EnvironmentOutlined /> {item.location}</p>
                          <p>主办方: {item.organizer}</p>
                          <p>完成时间: {item.completionDate}</p>
                          {item.rating && (
                            <p>
                              <StarOutlined /> 评分: 
                              <Rate disabled defaultValue={item.rating} style={{ fontSize: 14, marginLeft: 8 }} />
                            </p>
                          )}
                          <div>
                            {item.tags.map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                </Card>
              )}
            />
          ) : (
            <Empty description="您还没有完成任何活动" />
          )}
        </TabPane>
      </Tabs>
      
      {/* 活动详情模态框 */}
      <Modal
        title="活动详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedActivity && (
          <div>
            <h3>{selectedActivity.title}</h3>
            <p><strong>时间:</strong> {selectedActivity.date}</p>
            <p><strong>地点:</strong> {selectedActivity.location}</p>
            <p><strong>主办方:</strong> {selectedActivity.organizer}</p>
            <p><strong>积分:</strong> {selectedActivity.points}</p>
            <p><strong>联系方式:</strong> {selectedActivity.contact}</p>
            <p><strong>活动描述:</strong></p>
            <p>{selectedActivity.description}</p>
            <div>
              <strong>活动标签:</strong>
              {selectedActivity.tags.map(tag => (
                <Tag key={tag} style={{ margin: '0 4px' }}>{tag}</Tag>
              ))}
            </div>
            {selectedActivity.status === 'ended' && (
              <div style={{ marginTop: 16 }}>
                <p><strong>完成时间:</strong> {selectedActivity.completionDate}</p>
                {selectedActivity.feedback && (
                  <>
                    <p><strong>您的反馈:</strong></p>
                    <p>{selectedActivity.feedback}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
      
      {/* 反馈提交模态框 */}
      <Modal
        title="活动反馈"
        open={isFeedbackModalVisible}
        onOk={handleSubmitFeedback}
        onCancel={() => setIsFeedbackModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="rating"
            label="活动评分"
            rules={[{ required: true, message: '请给活动评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="feedback"
            label="反馈内容"
            rules={[{ required: true, message: '请输入反馈内容' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请分享您对本次活动的感受和建议..." 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 