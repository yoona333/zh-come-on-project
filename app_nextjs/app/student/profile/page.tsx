'use client';

import { useState } from 'react';
import { Card, Row, Col, Form, Input, Button, Upload, message, Avatar, Tabs, List, Tag, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, UploadOutlined, EditOutlined, SaveOutlined, TeamOutlined, TrophyOutlined, CameraOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import styles from '../../../src/styles/Profile.module.scss';

const { TabPane } = Tabs;

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  
  // 模拟用户数据
  const userData = {
    id: '20210001',
    name: '张三',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    department: '计算机科学与技术学院',
    major: '软件工程',
    grade: '2021级',
    class: '软工2班',
    address: '学生公寓 3号楼 422室',
    bio: '热爱编程和设计，喜欢参加各种校园活动。',
  };
  
  // 模拟社团数据
  const clubs = [
    { id: 1, name: '计算机协会', role: '会员', joinDate: '2021-09-15' },
    { id: 2, name: '篮球社', role: '社长', joinDate: '2021-10-05' },
    { id: 3, name: '摄影协会', role: '会员', joinDate: '2022-03-10' },
  ];
  
  // 模拟成就数据
  const achievements = [
    { id: 1, name: '活动达人', description: '参加10次以上校园活动', date: '2022-12-20', icon: '🏆' },
    { id: 2, name: '志愿先锋', description: '累计志愿服务时间超过50小时', date: '2023-03-15', icon: '🌟' },
    { id: 3, name: '社团骨干', description: '担任社团负责人', date: '2022-09-10', icon: '👑' },
  ];
  
  // 处理表单提交
  const handleSubmit = (values: any) => {
    setLoading(true);
    console.log('提交的表单数据:', values);
    
    // 模拟API调用
    setTimeout(() => {
      message.success('个人信息更新成功！');
      setLoading(false);
      setEditing(false);
    }, 1000);
  };
  
  // 处理头像上传
  const uploadProps: UploadProps = {
    name: 'avatar',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    showUploadList: false,
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };
  
  return (
    <div className={styles.profilePage}>
      <h2>个人信息</h2>
      
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card className={styles.avatarCard}>
            <div className={styles.avatarContainer}>
              <Avatar 
                size={120} 
                src={userData.avatar}
                icon={<UserOutlined />}
                className={styles.avatar}
              />
              <Upload {...uploadProps}>
                <div className={styles.uploadButton}>
                  <CameraOutlined />
                </div>
              </Upload>
            </div>
            <div className={styles.userInfo}>
              <h3>{userData.name}</h3>
              <p>{userData.department} | {userData.major}</p>
              <Divider />
              <div className={styles.infoItem}>
                <MailOutlined className={styles.icon} />
                {userData.email}
              </div>
              <div className={styles.infoItem}>
                <PhoneOutlined className={styles.icon} />
                {userData.phone}
              </div>
              <div className={styles.infoItem}>
                <HomeOutlined className={styles.icon} />
                {userData.address}
              </div>
              <div className={styles.infoItem}>
                <TeamOutlined className={styles.icon} />
                {userData.class}
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card 
            className={styles.infoCard}
            extra={
              editing ? (
                <Button 
                  type="text" 
                  icon={<CloseCircleOutlined />} 
                  onClick={() => setEditing(false)}
                >
                  取消
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={() => setEditing(true)}
                >
                  编辑
                </Button>
              )
            }
          >
            <Tabs defaultActiveKey="basic">
              <TabPane tab="基本信息" key="basic">
                {editing ? (
                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                      name: userData.name,
                      email: userData.email,
                      phone: userData.phone,
                      address: userData.address,
                      bio: userData.bio,
                    }}
                    onFinish={handleSubmit}
                  >
                    <div className={styles.formSection}>
                      <h3>个人资料</h3>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="name"
                            label="姓名"
                            rules={[{ required: true, message: '请输入姓名' }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="email"
                            label="邮箱"
                            rules={[
                              { required: true, message: '请输入邮箱' },
                              { type: 'email', message: '请输入有效的邮箱地址' }
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="phone"
                            label="手机号"
                            rules={[{ required: true, message: '请输入手机号' }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="address"
                            label="宿舍地址"
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name="bio"
                        label="个人简介"
                      >
                        <Input.TextArea rows={4} />
                      </Form.Item>
                    </div>
                    
                    <div className={styles.actionButtons}>
                      <Button onClick={() => setEditing(false)}>取消</Button>
                      <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                        保存更改
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div>
                    <div className={styles.formSection}>
                      <h3>个人资料</h3>
                      <Row gutter={16}>
                        <Col span={12}>
                          <p><strong>姓名:</strong> {userData.name}</p>
                          <p><strong>学号:</strong> {userData.id}</p>
                          <p><strong>学院:</strong> {userData.department}</p>
                          <p><strong>专业:</strong> {userData.major}</p>
                        </Col>
                        <Col span={12}>
                          <p><strong>年级:</strong> {userData.grade}</p>
                          <p><strong>班级:</strong> {userData.class}</p>
                          <p><strong>邮箱:</strong> {userData.email}</p>
                          <p><strong>手机号:</strong> {userData.phone}</p>
                        </Col>
                      </Row>
                      <p><strong>宿舍地址:</strong> {userData.address}</p>
                      <p><strong>个人简介:</strong> {userData.bio}</p>
                    </div>
                  </div>
                )}
              </TabPane>
              
              <TabPane tab="我的社团" key="clubs">
                <List
                  dataSource={clubs}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Tag color="blue">{item.role}</Tag>
                      ]}
                    >
                      <List.Item.Meta
                        title={item.name}
                        description={
                          <div className={styles.clubsMeta}>
                            <span>加入时间: {item.joinDate}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
              
              <TabPane tab="我的成就" key="achievements">
                <List
                  className={styles.achievementsList}
                  dataSource={achievements}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<span className={styles.achievementIcon}>{item.icon}</span>}
                        title={item.name}
                        description={
                          <div>
                            <p>{item.description}</p>
                            <p>获得时间: {item.date}</p>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
              
              <TabPane tab="账号安全" key="security">
                <Button type="primary">修改密码</Button>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
} 