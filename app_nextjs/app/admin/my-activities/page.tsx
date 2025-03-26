'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './activity-list.module.scss'; // 导入SCSS文件

const ActivityListPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:3001/my/activities', {
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

 // ... existing code ...

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
        // 退出活动成功后刷新页面
        window.location.reload(); 
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
    <div className={styles.activityListContainer}> 
      <h1 className={styles.title}>活动列表</h1>
      {loading ? (
        <p className={styles.loading}>加载中...</p>
      ) : error ? (
        <p className={styles.error}>错误: {error}</p>
      ) : activities.length === 0 ? (
        <p className={styles.empty}>没有找到活动。</p>
      ) : (
        <ul className={styles.activityList}>
          {activities.map((activity, index) => (
            <li key={index} className={styles.activityItem}>
              <div className={styles.activityContent}>
                <h2 className={styles.activityTitle}>{activity.title}</h2>
                <p className={styles.activityDate}>日期: {activity.date}</p>
                <p className={styles.activityLocation}>地点: {activity.location}</p>
                <p className={styles.activityPoints}>积分: {activity.points}</p>
                <p className={styles.activityTags}>标签: {activity.tags}</p>
                <p className={styles.activityTags}>参与人数: {activity.participant_count}/{activity.participant_count_max}</p>
                <p className={styles.activityContact}>联系方式: {activity.contact}</p>
                <button className={styles.signUpButton} onClick={() => handleSignUp(activity.id)}>参与活动</button>
                <button className={styles.cancelSignUpButton} onClick={() => handleCancelSignUp(activity.id)}>退出活动</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {popupMessage && (
        <div className={styles.popupMessage}>
          <p className={styles.message}>{popupMessage}</p>
          <button className={styles.closeButton} onClick={() => setPopupMessage(null)}>关闭</button>
        </div>
      )}
    </div>
  );
};

export default ActivityListPage;