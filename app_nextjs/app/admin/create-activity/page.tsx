'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './activity-list.module.scss'; // 导入SCSS文件

const CreateActivityPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [points, setPoints] = useState('');
  const [club_id, setClubId] = useState('');
  const [tags, setTags] = useState('');
  const [contact, setContact] = useState('');
  // 新增 participant_count_max 状态
  const [participant_count_max, setParticipantCountMax] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/activities', {
        method: 'POST',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          date,
          location,
          points: parseInt(points),
          club_id: parseInt(club_id),
          tags,
          contact,
          // 新增 participant_count_max 字段
          participant_count_max: parseInt(participant_count_max)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create activity');
      }

      setSuccessMessage('活动创建成功！');
      // 清空表单，新增 participant_count_max 清空操作
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setPoints('');
      setClubId('');
      setTags('');
      setContact('');
      setParticipantCountMax('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.activityListContainer}>
      <h1 className={styles.title}>创建活动</h1>
      {error && <p className={styles.error}>错误: {error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label className={styles.label}>
          标题:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          描述:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
          />
        </label>
        <label className={styles.label}>
          日期:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          地点:
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          积分:
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          社团 ID:
          <input
            type="number"
            value={club_id}
            onChange={(e) => setClubId(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          标签:
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          联系方式:
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className={styles.input}
          />
        </label>
        {/* 新增 participant_count_max 输入框 */}
        <label className={styles.label}>
          最大参与人数:
          <input
            type="number"
            value={participant_count_max}
            onChange={(e) => setParticipantCountMax(e.target.value)}
            className={styles.input}
          />
        </label>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? '创建中...' : '创建活动'}
        </button>
      </form>
    </div>
  );
};

export default CreateActivityPage;