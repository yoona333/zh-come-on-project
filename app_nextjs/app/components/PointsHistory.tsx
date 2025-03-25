import React from 'react';
import styles from '../css/points.module.css';

interface PointRecord {
  id: number;
  points: number;
  description: string;
  activity_title: string;
  assigned_by: string;
  assigned_at: string;
}

interface PointsHistoryProps {
  records: PointRecord[];
}

const PointsHistory: React.FC<PointsHistoryProps> = ({ records }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  const getPointClass = (points: number) => {
    return points >= 0 ? styles.positivePoints : styles.negativePoints;
  };

  return (
    <div className={styles.historyContainer}>
      <h2>积分历史记录</h2>
      {records.length === 0 ? (
        <p className={styles.noRecords}>暂无积分记录</p>
      ) : (
        <div className={styles.historyList}>
          {records.map(record => (
            <div key={record.id} className={styles.historyItem}>
              <div className={styles.historyHeader}>
                <span className={styles.activityTitle}>{record.activity_title}</span>
                <span className={getPointClass(record.points)}>
                  {record.points > 0 ? '+' : ''}{record.points}
                </span>
              </div>
              
              <p className={styles.description}>{record.description}</p>
              
              <div className={styles.historyFooter}>
                <span className={styles.assignedBy}>由 {record.assigned_by} 分配</span>
                <span className={styles.date}>{formatDate(record.assigned_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PointsHistory; 