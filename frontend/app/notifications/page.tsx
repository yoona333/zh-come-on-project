'use client';

import { Card, Table, message } from 'antd';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// 定义 Reservation 接口，添加 activities 表的重要字段
interface Reservation {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  status: number;
  // 其他字段...
}

export default function StudentReservations() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('请先登录');
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        message.error('登录已过期，请重新登录');
        router.push('/login');
        return;
      }

      fetchReservations(token);
    } catch (error) {
      message.error('无效的登录信息，请重新登录');
      router.push('/login');
    }
  };

  const fetchReservations = async (token: string) => {
    try {
      setLoading(true);
      const url = 'http://localhost:8080/api/reservations/upcoming';
      const response = await axios.get(url, {
        headers: { 'x-access-token': token }
      });

      if (response.data.success) {
        const reservationsData = response.data.data;
        setReservations(reservationsData);
      }
    } catch (error) {
      console.error('获取预约列表失败:', error);
      message.error('获取预约列表失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 修改 columns 数组，添加更多列
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '活动标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '活动描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
    },
    {
      title: '活动地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '最大参与人数',
      dataIndex: 'max_participants',
      key: 'max_participants',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        switch (status) {
          case 0:
            return '待审批';
          case 1:
            return '已通过';
          case 2:
            return '已拒绝';
          default:
            return '未知状态';
        }
      },
    },
  ];

  return (
    <div>
      <Card title="即将开始的预约列表">
        <Table
          columns={columns}
          dataSource={reservations}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}