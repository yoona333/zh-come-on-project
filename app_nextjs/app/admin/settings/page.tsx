'use client';

import { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Tabs, Switch, Select, Upload, message, Divider } from 'antd';
import { UploadOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import styles from '../../../src/styles/Admin.module.scss';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export default function SystemSettings() {
  const [loading, setLoading] = useState(false);
  const [basicForm] = Form.useForm();
  const [pointsForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  
  // 基本设置提交
  const handleBasicSubmit = (values: any) => {
    setLoading(true);
    console.log('基本设置:', values);
    
    // 模拟API调用
    setTimeout(() => {
      message.success('基本设置已保存');
      setLoading(false);
    }, 1000);
  };
  
  // 积分规则提交
  const handlePointsSubmit = (values: any) => {
    setLoading(true);
    console.log('积分设置:', values);
    
    // 模拟API调用
    setTimeout(() => {
      message.success('积分规则已保存');
      setLoading(false);
    }, 1000);
  };
  
  // 通知设置提交
  const handleNotificationSubmit = (values: any) => {
    setLoading(true);
    console.log('通知设置:', values);
    
    // 模拟API调用
    setTimeout(() => {
      message.success('通知设置已保存');
      setLoading(false);
    }, 1000);
  };
  
  // 重置表单
  const handleReset = (formName: string) => {
    switch(formName) {
      case 'basic':
        basicForm.resetFields();
        break;
      case 'points':
        pointsForm.resetFields();
        break;
      case 'notification':
        notificationForm.resetFields();
        break;
    }
    message.info('表单已重置');
  };
  
  // 上传 Logo
  const uploadProps: UploadProps = {
    name: 'logo',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };
  
  return (
    <div className={styles.adminPage}>
      <h2>系统设置</h2>
      
      <Tabs defaultActiveKey="basic">
        <TabPane tab="基本设置" key="basic">
          <Card className={styles.tableCard}>
            <Form
              form={basicForm}
              layout="vertical"
              onFinish={handleBasicSubmit}
              initialValues={{
                siteName: '攒劲Π校内活动积分系统',
                siteDescription: '校内社团活动管理与积分系统',
                contactEmail: 'admin@example.com',
                contactPhone: '123-456-7890',
                registrationEnabled: true,
                maintenanceMode: false,
              }}
            >
              <Form.Item
                name="siteName"
                label="系统名称"
                rules={[{ required: true, message: '请输入系统名称' }]}
              >
                <Input placeholder="请输入系统名称" />
              </Form.Item>
              
              <Form.Item
                name="siteDescription"
                label="系统描述"
              >
                <TextArea rows={3} placeholder="请输入系统描述" />
              </Form.Item>
              
              <Form.Item
                name="logo"
                label="系统徽标"
              >
                <Upload {...uploadProps} maxCount={1}>
                  <Button icon={<UploadOutlined />}>上传徽标</Button>
                </Upload>
              </Form.Item>
              
              <Divider orientation="left">联系方式</Divider>
              
              <Form.Item
                name="contactEmail"
                label="联系邮箱"
                rules={[
                  { required: true, message: '请输入联系邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入联系邮箱" />
              </Form.Item>
              
              <Form.Item
                name="contactPhone"
                label="联系电话"
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
              
              <Divider orientation="left">系统状态</Divider>
              
              <Form.Item
                name="registrationEnabled"
                label="允许注册"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="开启" 
                  unCheckedChildren="关闭" 
                />
              </Form.Item>
              
              <Form.Item
                name="maintenanceMode"
                label="维护模式"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="开启" 
                  unCheckedChildren="关闭" 
                />
              </Form.Item>
              
              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    onClick={() => handleReset('basic')} 
                    style={{ marginRight: 8 }}
                    icon={<ReloadOutlined />}
                  >
                    重置
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    保存设置
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="积分规则" key="points">
          <Card className={styles.tableCard}>
            <Form
              form={pointsForm}
              layout="vertical"
              onFinish={handlePointsSubmit}
              initialValues={{
                minActivityPoints: 5,
                maxActivityPoints: 30,
                clubCreationPoints: 50,
                joinClubPoints: 10,
                organizerBonus: 5,
                minRedeemPoints: 50,
                pointsExpiration: 'yearly',
              }}
            >
              <Form.Item
                name="minActivityPoints"
                label="最小活动积分"
                rules={[{ required: true, message: '请输入最小活动积分' }]}
              >
                <InputNumber min={1} max={100} />
              </Form.Item>
              
              <Form.Item
                name="maxActivityPoints"
                label="最大活动积分"
                rules={[{ required: true, message: '请输入最大活动积分' }]}
              >
                <InputNumber min={1} max={100} />
              </Form.Item>
              
              <Form.Item
                name="clubCreationPoints"
                label="创建社团积分"
                rules={[{ required: true, message: '请输入创建社团积分' }]}
              >
                <InputNumber min={0} max={100} />
              </Form.Item>
              
              <Form.Item
                name="joinClubPoints"
                label="加入社团积分"
                rules={[{ required: true, message: '请输入加入社团积分' }]}
              >
                <InputNumber min={0} max={50} />
              </Form.Item>
              
              <Form.Item
                name="organizerBonus"
                label="组织者额外积分"
                rules={[{ required: true, message: '请输入组织者额外积分' }]}
              >
                <InputNumber min={0} max={20} />
              </Form.Item>
              
              <Form.Item
                name="minRedeemPoints"
                label="最小兑换积分"
                rules={[{ required: true, message: '请输入最小兑换积分' }]}
              >
                <InputNumber min={0} max={100} />
              </Form.Item>
              
              <Form.Item
                name="pointsExpiration"
                label="积分有效期"
                rules={[{ required: true, message: '请选择积分有效期' }]}
              >
                <Select placeholder="请选择积分有效期">
                  <Option value="never">永不过期</Option>
                  <Option value="yearly">每年过期</Option>
                  <Option value="semester">每学期过期</Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    onClick={() => handleReset('points')} 
                    style={{ marginRight: 8 }}
                    icon={<ReloadOutlined />}
                  >
                    重置
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    保存设置
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="通知设置" key="notification">
          <Card className={styles.tableCard}>
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleNotificationSubmit}
              initialValues={{
                emailNotification: true,
                smsNotification: false,
                activityReminder: 24,
                newActivityNotification: true,
                pointsChangeNotification: true,
                systemAnnouncementNotification: true,
              }}
            >
              <Form.Item
                name="emailNotification"
                label="邮件通知"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="开启" 
                  unCheckedChildren="关闭" 
                />
              </Form.Item>
              
              <Form.Item
                name="smsNotification"
                label="短信通知"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="开启" 
                  unCheckedChildren="关闭" 
                />
              </Form.Item>
              
              <Form.Item
                name="activityReminder"
                label="活动提醒时间（小时）"
                rules={[{ required: true, message: '请输入活动提醒时间' }]}
              >
                <InputNumber min={1} max={72} />
              </Form.Item>
              
              <Divider orientation="left">通知类型</Divider>
              
              <Form.Item
                name="newActivityNotification"
                label="新活动通知"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="开启" 
                  unCheckedChildren="关闭" 
                />
              </Form.Item>
              
              <Form.Item
                name="pointsChangeNotification"
                label="积分变动通知"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="开启" 
                  unCheckedChildren="关闭" 
                />
              </Form.Item>
              
              <Form.Item
                name="systemAnnouncementNotification"
                label="系统公告通知"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="开启" 
                  unCheckedChildren="关闭" 
                />
              </Form.Item>
              
              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    onClick={() => handleReset('notification')} 
                    style={{ marginRight: 8 }}
                    icon={<ReloadOutlined />}
                  >
                    重置
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    保存设置
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
} 