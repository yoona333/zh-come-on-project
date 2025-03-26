'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../src/styles/ChangePasswordPage.scss'; // 导入 CSS 文件

interface User {
  username: string;
}

const ChangePasswordPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // 获取所有需要修改密码的用户
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/ischange/password');
        console.log('后端返回的数据:', response.data); // 打印后端返回的数据
        // 将后端返回的字符串数组转换为 User[] 类型
        const userList = response.data.map((username: string) => ({ username }));
        setUsers(userList);
        setLoading(false);
      } catch (error) {
        console.error('获取用户列表失败:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 单个用户修改密码
  const handleChangePassword = async (username: string) => {
    try {
      await axios.post('http://localhost:3001/ischange/password', {
        username,
        newPassword: '000000'
      });
      setMessage(`用户 ${username} 密码修改成功`);
    } catch (error) {
      console.error('修改密码失败:', error);
      setMessage(`用户 ${username} 密码修改失败`);
    }
  };

  // 一键修改所有用户密码
  const handleChangeAllPasswords = async () => {
    try {
      const requests = users.map(user =>
        axios.post('http://localhost:3001/ischange/password', {
          username: user.username,
          newPassword: '000000'
        })
      );
      await Promise.all(requests);
      setMessage('所有用户密码修改成功');
    } catch (error) {
      console.error('一键修改密码失败:', error);
      setMessage('一键修改密码失败');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>待修改密码用户</h1>
        <button className="view-all-btn" onClick={handleChangeAllPasswords}>
          一键修改
        </button>
      </div>
      <div className="content">
        {loading ? (
          <p className="loading-text">加载中...</p>
        ) : (
          <div className="user-list">
            {users.map(user => (
              <div key={user.username} className="user-card">
                <div className="user-info">
                  <h3 className="user-name">{user.username}</h3>
                  <p className="user-status">状态: 待修改</p>
                </div>
                <div className="action-buttons">
                  <button 
                    className="approve-btn"
                    onClick={() => handleChangePassword(user.username)}
                  >
                    确认修改
                  </button>
                  {/* 如果需要拒绝功能，可以添加拒绝按钮 */}
                </div>
              </div>
            ))}
          </div>
        )}
        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
};

export default ChangePasswordPage;