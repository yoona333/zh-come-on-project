// AddError.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Home from '../../homedaohan/page'; // 引入 Sidebar 组件
import withAuthentication from '../../api/jwt'; // 确保导入路径正确
import styles from '../../css/add.module.css'; // 导入CSS模块

// 定义表单项接口
interface FormValues {
  Wrong_name: string;
  Wrong_content: string;
  Wrong_type: string;
  Wrong_file: string;
  Wrong_author: string;
}

// 使用 withAuthentication 包裹 AddError 组件
const AddError: React.FC = () => {
  const [formData, setFormData] = useState<FormValues>({
    Wrong_name: '',
    Wrong_content: '',
    Wrong_type: '',
    Wrong_file: '',
    Wrong_author: '',
  });
  const history = useHistory();

  // 检查 token 存在性
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      history.push('/login'); // 如果没有 token，重定向到登录页面
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
  
    if (!token) {
      history.push('/login');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/errorbank/my/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        const error = new Error('Network response was not ok');
        (error as any).response = response; // 将 response 附加到错误对象上
        throw error;
      }
  
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }
  
      alert('Error record added successfully');
      history.push('/errorbank'); // 假设这是您的错误列表页面
    } catch (error: any) { // 使用 any 类型来捕获所有可能的错误类型
      console.error('Error adding error record:', error);
      if (error.response) {
        // 如果错误对象有 response 属性，处理 HTTP 错误
        error.message = `HTTP error status: ${error.response.status}`;
      }
      alert('Error adding error record: ' + error.message);
    }
  };


    return (
      <div className={`${styles.container}`}>
        <Home />
        <div className={`${styles.content}`}>
          <h1>Add Error Record</h1>
          <form onSubmit={handleSubmit} className={`${styles.form}`}>
            <input
              type="text"
              name="Wrong_name"
              placeholder="错题名称"
              value={formData.Wrong_name}
              onChange={handleChange}
              className={`${styles.inputField}`}
            />
            <textarea
              name="Wrong_content"
              placeholder="错题内容"
              value={formData.Wrong_content}
              onChange={handleChange}
              className={`${styles.textareaField}`}
            />
            {/* 重复应用样式给其他输入项... */}
            <input
              type="text"
              name="Wrong_type"
              placeholder="错题类型"
              value={formData.Wrong_type}
              onChange={handleChange}
              className={`${styles.inputField}`}
            />
                    <input
            type="text"
            name="Wrong_file"
            placeholder="错题文件"
            value={formData.Wrong_file}
            onChange={handleChange}
            className={`${styles.inputField}`}
          />
            {/* ...其他输入项... */}
  
            <button type="submit" className={`${styles.submitButton}`}>
              Add Error
            </button>
          </form>
        </div>
      </div>
    );
  };
    

// 导出经过 withAuthentication 包装的 AddError 组件
export default withAuthentication(AddError);