"use client";


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import withAuthentication from '../../api/jwt'; // 确保导入路径正确
import styles from '../../css/UpdateError.module.css'; // 引入 CSS 样式

interface ErrorBankItem {
  id: number;
  Wrong_name: string;
  Wrong_content: string;
  Wrong_type: string;
  Wrong_file: string;
  Wrong_author: string;
}

const UpdateErrorPage: React.FC = () => {
  const [formData, setFormData] = useState<ErrorBankItem>({
    id: 0,
    Wrong_name: '',
    Wrong_content: '',
    Wrong_type: '',
    Wrong_file: '',
    Wrong_author: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const token = localStorage.getItem('token');
  const url = new URL(window.location.href);
  const id = url.searchParams.get('id');

  useEffect(() => {
    if (!id) {
      setError('Error: No ID provided for update.');
      return;
    }

    const fetchErrorRecord = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/errorbank/my/${id}`, {
          headers: { 'x-access-token': token },
        });
        setFormData(response.data);
      } catch (err) {
        // setError('Failed to fetch error details.');
      }
    };

    fetchErrorRecord();
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await axios.put(`http://localhost:3000/errorbank/my/update/${id}`, formData, {
        headers: { 'Content-Type': 'application/json', 'x-access-token': token },
      });
      if (response.data.success) {
        window.alert('Error record updated successfully.');
        window.location.href = '/myerrorbank'; // 重定向到个人错题库页面
      } else {
        setError('Error updating error record.');
      }
    } catch (err) {
      setError('An error occurred while updating the error record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.updateErrorPageContainer}>
      {error && <p className={styles.errorMessage}>{error}</p>}
      <h1>Update Error Record</h1>
      <form onSubmit={handleSubmit} className={styles.updateForm}>
        <input
          type="text"
          name="Wrong_name"
          placeholder="Wrong Name"
          value={formData.Wrong_name}
          onChange={handleChange}
          required
          className={styles.inputField}
        />
        <textarea
          name="Wrong_content"
          placeholder="Wrong Content"
          value={formData.Wrong_content}
          onChange={handleChange}
          required
          className={styles.textareaField}
        ></textarea>
                  <input
            type="text"
            name="Wrong_type"
            placeholder="Wrong type"
            value={formData.Wrong_type}
            onChange={handleChange}
            required
            className={styles.inputField}
          />
                    <input
            type="text"
            name="Wrong_file"
            placeholder="Wrong file"
            value={formData.Wrong_file}
            onChange={handleChange}
            required
            className={styles.inputField}
          />

        {/* 其他表单输入 */}
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          Update Error
        </button>
      </form>
    </div>
  );
};

// 使用 withAuthentication 包裹 UpdateErrorPage 组件并导出
export default withAuthentication(UpdateErrorPage);