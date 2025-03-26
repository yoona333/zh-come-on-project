'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 导入 scss 模块
import styles from '../../../src/styles/activity-list.module.scss'; 

const ActivityListPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
//   const username = localStorage.getItem('username'); 
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:3001/activities', {
          headers: {
            'x-access-token': token
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const data = await response.json();
        if (Array.isArray(data.data)) {
          setActivities(data.data);
        } else {
          console.error('Received data is not an array:', data);
          setError('Received data is not in the expected format.');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [router]);

  const handleSignUp = async (activityId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/activities/${activityId}/signup`, {
        method: 'POST',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activityId }) 
      });

      if (!response.ok) {
        throw new Error('Failed to sign up for the activity');
      }

      const newResponse = await fetch('http://localhost:3001/activities', {
        headers: {
          'x-access-token': token
        },
      });

      if (!newResponse.ok) {
        throw new Error('Failed to fetch activities');
      }

      const newData = await newResponse.json();
      if (Array.isArray(newData.data)) {
        setActivities(newData.data);
        setPopupMessage('参与活动成功！');
      } else {
        console.error('Received new data is not an array:', newData);
        setError('Received new data is not in the expected format.');
        setPopupMessage('参与活动失败！');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        setPopupMessage('参与活动失败！');
      }
    }
  };

  const handleCancelSignUp = async (activityId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/activities/${activityId}/withdraw`, {
        method: 'POST',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activityId }) 
      });

      if (!response.ok) {
        throw new Error('Failed to cancel sign up for the activity');
      }

      const newResponse = await fetch('http://localhost:3001/activities', {
        headers: {
          'x-access-token': token
        },
      });

      if (!newResponse.ok) {
        throw new Error('Failed to fetch activities');
      }

      const newData = await newResponse.json();
      if (Array.isArray(newData.data)) {
        setActivities(newData.data);
        setPopupMessage('退出活动成功！');
      } else {
        console.error('Received new data is not an array:', newData);
        setError('Received new data is not in the expected format.');
        setPopupMessage('退出活动失败！');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        setPopupMessage('退出活动失败！');
      }
    }
  };

  return (
    // 使用导入的样式类
    <div className={styles['activity-list-container']}> 
      <h1>活动列表</h1>
      {loading ? (
        <p>加载中...</p>
      ) : error ? (
        <p>错误: {error}</p>
      ) : activities.length === 0 ? (
        <p>没有找到活动。</p>
      ) : (
        <ul>
          {activities.map((activity, index) => (
            <li key={index}>
              <h2>{activity.title}</h2>
              <p>{activity.description}</p>
              <p>日期: {activity.date}</p>
              <p>地点: {activity.location}</p>
              <p>积分: {activity.points}</p>
              <button onClick={() => handleSignUp(activity.id)}>参与活动</button>
              <button onClick={() => handleCancelSignUp(activity.id)}>退出活动</button>
            </li>
          ))}
        </ul>
      )}
      {popupMessage && (
        // 使用导入的样式类
        <div className={styles['popup-message']}> 
          <p>{popupMessage}</p>
          <button onClick={() => setPopupMessage(null)}>关闭</button>
        </div>
      )}
    </div>
  );
};

export default ActivityListPage;