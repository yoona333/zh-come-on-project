'use client';

import { useState } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Select, Button, Upload, message, Divider, Row, Col } from 'antd';
import { UploadOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import styles from '../../../src/styles/CreateActivity.module.scss';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function CreateActivity() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  
  // 处理表单提交
  const handleSubmit = (values: any) => {
    setLoading(true);
    console.log('提交的表单数据:', values);
    
    // 预览模式
    if (previewMode) {
      setFormData(values);
      setLoading(false);
      return;
    }
    
    // 模拟API调用
    setTimeout(() => {
      message.success('活动创建成功！等待管理员审核');
      setLoading(false);
      form.resetFields();
    }, 1500);
  };
  
  // 处理预览
  const handlePreview = () => {
    form.validateFields().then(values => {
      setFormData(values);
      setPreviewMode(true);
    }).catch(error => {
      message.error('表单填写有误，请检查');
    });
  };
  
  // 返回编辑
  const handleBackToEdit = () => {
    setPreviewMode(false);
  };
  
  // 上传图片
  const uploadProps: UploadProps = {
    name: 'file',
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
  
  // 渲染预览模式
  if (previewMode && formData) {
    return (
      <div className={styles.createActivityPage}>
        <h2>活动预览</h2>
        
        <Card className={styles.previewCard}>
          <h3>{formData.title}</h3>
          
          <Row gutter={16}>
            <Col span={16}>
              <div className={styles.previewSection}>
                <h4>基本信息</h4>
                <p><strong>活动时间:</strong> {formData.activityTime[0].format('YYYY-MM-DD HH:mm')} 至 {formData.activityTime[1].format('YYYY-MM-DD HH:mm')}</p>
                <p><strong>活动地点:</strong> {formData.location}</p>
                <p><strong>主办方:</strong> {formData.organizer}</p>
                <p><strong>活动类型:</strong> {formData.activityType.join(', ')}</p>
                <p><strong>参与人数上限:</strong> {formData.maxParticipants} 人</p>
                <p><strong>活动积分:</strong> {formData.points} 分</p>
              </div>
              
              <Divider />
              
              <div className={styles.previewSection}>
                <h4>活动描述</h4>
                <p>{formData.description}</p>
              </div>
              
              <div className={styles.previewSection}>
                <h4>参与要求</h4>
                <p>{formData.requirements}</p>
              </div>
              
              {formData.schedule && formData.schedule.length > 0 && (
                <>
                  <Divider />
                  <div className={styles.previewSection}>
                    <h4>活动日程</h4>
                    <ul>
                      {formData.schedule.map((item: any, index: number) => (
                        <li key={index}>
                          <p><strong>{item.time}</strong> - {item.content}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </Col>
            
            <Col span={8}>
              <div className={styles.previewContact}>
                <h4>联系方式</h4>
                <p><strong>联系人:</strong> {formData.contactPerson}</p>
                <p><strong>联系电话:</strong> {formData.contactPhone}</p>
                <p><strong>联系邮箱:</strong> {formData.contactEmail}</p>
              </div>
            </Col>
          </Row>
          
          <div className={styles.previewActions}>
            <Button onClick={handleBackToEdit} style={{ marginRight: 8 }}>返回编辑</Button>
            <Button 
              type="primary" 
              onClick={() => handleSubmit(formData)}
              loading={loading}
            >
              确认提交
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={styles.createActivityPage}>
      <h2>创建活动</h2>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            activityType: ['文艺'],
            schedule: [{ time: '', content: '' }]
          }}
        >
          <div className={styles.formSection}>
            <h3>基本信息</h3>
            
            <Form.Item
              name="title"
              label="活动名称"
              rules={[{ required: true, message: '请输入活动名称' }]}
            >
              <Input placeholder="请输入活动名称" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="activityTime"
                  label="活动时间"
                  rules={[{ required: true, message: '请选择活动时间' }]}
                >
                  <RangePicker 
                    showTime 
                    format="YYYY-MM-DD HH:mm" 
                    style={{ width: '100%' }}
                    placeholder={['开始时间', '结束时间']}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="location"
                  label="活动地点"
                  rules={[{ required: true, message: '请输入活动地点' }]}
                >
                  <Input placeholder="请输入活动地点" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="organizer"
                  label="主办方"
                  rules={[{ required: true, message: '请输入主办方' }]}
                >
                  <Input placeholder="请输入主办方" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="activityType"
                  label="活动类型"
                  rules={[{ required: true, message: '请选择活动类型' }]}
                >
                  <Select 
                    mode="multiple" 
                    placeholder="请选择活动类型"
                    maxTagCount={3}
                  >
                    <Option value="文艺">文艺</Option>
                    <Option value="体育">体育</Option>
                    <Option value="科技">科技</Option>
                    <Option value="志愿者">志愿者</Option>
                    <Option value="讲座">讲座</Option>
                    <Option value="比赛">比赛</Option>
                    <Option value="公益">公益</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="maxParticipants"
                  label="参与人数上限"
                  rules={[{ required: true, message: '请输入参与人数上限' }]}
                >
                  <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="points"
                  label="活动积分"
                  rules={[{ required: true, message: '请输入活动积分' }]}
                >
                  <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </div>
          
          <Divider />
          
          <div className={styles.formSection}>
            <h3>活动详情</h3>
            
            <Form.Item
              name="description"
              label="活动描述"
              rules={[{ required: true, message: '请输入活动描述' }]}
            >
              <TextArea rows={4} placeholder="请详细描述活动内容、目的等信息" />
            </Form.Item>
            
            <Form.Item
              name="requirements"
              label="参与要求"
              rules={[{ required: true, message: '请输入参与要求' }]}
            >
              <TextArea rows={3} placeholder="请描述参与活动的要求，如专业限制、技能要求等" />
            </Form.Item>
            
            <Form.Item
              name="poster"
              label="活动海报"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>上传海报</Button>
              </Upload>
            </Form.Item>
            
            <div className={styles.scheduleSection}>
              <h4>活动日程安排（可选）</h4>
              <Form.List name="schedule">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row gutter={16} key={key} style={{ marginBottom: 8 }}>
                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'time']}
                            rules={[{ required: true, message: '请输入时间' }]}
                          >
                            <Input placeholder="时间点，如 09:00-10:00" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={14}>
                          <Form.Item
                            {...restField}
                            name={[name, 'content']}
                            rules={[{ required: true, message: '请输入内容' }]}
                          >
                            <Input placeholder="活动内容" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={2} style={{ textAlign: 'center' }}>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                      >
                        添加日程项
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          </div>
          
          <Divider />
          
          <div className={styles.formSection}>
            <h3>联系方式</h3>
            
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="contactPerson"
                  label="联系人"
                  rules={[{ required: true, message: '请输入联系人' }]}
                >
                  <Input placeholder="请输入联系人姓名" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="contactPhone"
                  label="联系电话"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
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
              </Col>
            </Row>
          </div>
          
          <div className={styles.formActions}>
            <Button onClick={() => form.resetFields()} style={{ marginRight: 8 }}>
              重置
            </Button>
            <Button onClick={handlePreview} style={{ marginRight: 8 }}>
              预览
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              提交
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
} 