'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './activity-list.module.scss'; // 导入SCSS文件
import { Table, Tag, Button, message, Spin, Typography, Modal } from 'antd';
import axios from 'axios';
import Link from 'next/link';

const { Title } = Typography;

interface Activity {
  id: number;
  title: string;
  location: string;
  start_time: string;
  end_time: string;
  status: number;
  points: number;
  club_name: string;
}

// 定义活动详情的接口
interface ActivityDetail extends Activity {
  // 可以根据实际后端返回的数据添加更多字段
  description: string;
  organizer: string;
  // 其他字段...
}

const ActivityListPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  // 新增状态：控制模态框显示隐藏
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  // 新增状态：存储活动详情信息
  const [activityDetail, setActivityDetail] = useState<ActivityDetail | null>(null);
  // 新增状态：模态框加载状态
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchMyActivities();
  }, []);

  const fetchMyActivities = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8080/api/activities/my', {
        headers: { 'x-access-token': token }
      });

      if (response.data.success) {
        setActivities(response.data.data || []);
      } else {
        message.error(response.data.message || '获取活动失败');
      }
    } catch (error) {
      console.error('获取我的活动失败:', error);
      message.error('获取活动数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0: return <Tag color="orange">未开始</Tag>;
      case 1: return <Tag color="green">进行中</Tag>;
      case 2: return <Tag color="blue">已结束</Tag>;
      case 3: return <Tag color="red">已取消</Tag>;
      default: return <Tag color="default">未知</Tag>;
    }
  };

  const showActivityDetail = async (activityId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      return;
    }
    setModalLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/activities/my?activityId=${activityId}`, {
        headers: { 'x-access-token': token }
      });
      if (response.data.success) {
        // 假设后端返回的第一条数据就是详情信息
        setActivityDetail(response.data.data[0]);
        setDetailModalVisible(true);
      } else {
        message.error(response.data.message || '获取活动详情失败');
      }
    } catch (error) {
      console.error('获取活动详情失败:', error);
      message.error('获取活动详情失败，请检查网络连接');
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Activity) => (
        <Link href={`/student/activities/${record.id}`}>{text}</Link>
      )
    },
    {
      title: '社团',
      dataIndex: 'club_name',
      key: 'club_name',
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => getStatusTag(status)
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Activity) => (
        <Button type="link" onClick={() => showActivityDetail(record.id)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>我的活动</Title>
      <Table 
        columns={columns} 
        dataSource={activities} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: '暂无活动数据' }}
      />
      {/* 活动详情弹窗 */}
      <Modal
        title={activityDetail?.title}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
        loading={modalLoading}
      >
        {activityDetail && (
          <div>
            <p><strong>活动描述：</strong>{activityDetail.description}</p>
            <p><strong>举办社团：</strong>{activityDetail.club_name}</p>
            <p><strong>活动地点：</strong>{activityDetail.location}</p>
            <p><strong>开始时间：</strong>{new Date(activityDetail.start_time).toLocaleString()}</p>
            <p><strong>结束时间：</strong>{new Date(activityDetail.end_time).toLocaleString()}</p>
            <p><strong>状态：</strong>{getStatusTag(activityDetail.status)}</p>
            <p><strong>积分：</strong>{activityDetail.points}</p>
            <p><strong>组织者：</strong>{activityDetail.organizer}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActivityListPage;