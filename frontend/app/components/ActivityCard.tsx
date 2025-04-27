import React from 'react';
import axios from 'axios';
import styles from '../css/activity.module.css';

interface ActivityProps {
  activity: {
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    points: number;
    organizer: string;
    isJoined?: boolean;
  };
  onStatusChange?: () => void;
}

const ActivityCard: React.FC<ActivityProps> = ({ activity, onStatusChange }) => {
  const handleJoinToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const endpoint = activity.isJoined 
        ? `http://localhost:3001/activities/${activity.id}/leave`
        : `http://localhost:3001/activities/${activity.id}/join`;
      
      const response = await axios.post(endpoint, {}, {
        headers: { 'x-access-token': token }
      });
      
      if (response.data.success && onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };
  
  // 格式化日期和时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.activityCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{activity.title}</h3>
        <span className={styles.points}>{activity.points} 积分</span>
      </div>
      
      <p className={styles.description}>
        {activity.description.length > 100 
          ? `${activity.description.substring(0, 100)}...` 
          : activity.description}
      </p>
      
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <i className={styles.icon}>📅</i>
          <span>{formatDate(activity.date)}</span>
        </div>
        <div className={styles.detailItem}>
          <i className={styles.icon}>📍</i>
          <span>{activity.location}</span>
        </div>
        <div className={styles.detailItem}>
          <i className={styles.icon}>👤</i>
          <span>{activity.organizer}</span>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button 
          onClick={handleJoinToggle}
          className={activity.isJoined ? styles.leaveButton : styles.joinButton}
        >
          {activity.isJoined ? '取消参加' : '参加活动'}
        </button>
        <a href={`/activities/${activity.id}`} className={styles.detailsLink}>
          查看详情
        </a>
      </div>
    </div>
  );
};

export default ActivityCard; 