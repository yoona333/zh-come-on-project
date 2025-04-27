"use client";

// ErrorBankPage（总错题库页面）
import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Home from '../homedaohan/page'; // 引入Sidebar组件
import ErrorDetailModal from '../css/ErrorDetailModal'; // 引入模态框组件
import styles from './ErrorBankPage.module.css'; // 修改这一行
import withAuthentication from '../api/jwt';

// 定义API响应的类型
interface ErrorBankItem {
  id: number;
  Wrong_name: string;
  Wrong_content: string;
  Wrong_type: string;
  Wrong_file: string;
  Wrong_author: string;
}

// interface ApiResponse {
//   success: boolean;
//   data: ErrorBankItem[];
//   totalPages: number;
// }

const ErrorBankPage: React.FC = () => {
  const [errorBankData, setErrorBankData] = useState<ErrorBankItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [limit] = useState<number>(4); // 每页显示的记录数
  const [name, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedErrorItem, setSelectedErrorItem] = useState<ErrorBankItem | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, limit, name]); // 依赖项变化时重新获取数据

  const fetchData = async () => {
    try {
      // 根据搜索框中是否有数据来构造URL
      let url = 'http://localhost:3001/errorbank';
      if (name) {
        url += `/zong/${encodeURIComponent(name)}`;
      }
  
      // 发起GET请求
      const response = await axios.get<{ success: boolean; data: ErrorBankItem[]; totalPages: number }>(url, {
        params: { page: currentPage, limit: limit }
      });
  
      // 检查响应中是否有success字段，以及它的值是否为true
      if (!response.data.success) {
        throw new Error('Request failed');
      }
  
      // 更新状态
      setErrorBankData(response.data.data);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err: unknown) {
      // 检查错误是否是AxiosError类型
      if (axios.isAxiosError(err)) {
        const typedError = err as AxiosError;
        setError(typedError.message || 'An error occurred while fetching data.');
      } else {
        // 处理非AxiosError类型的错误
        setError('An unknown error occurred');
      }
    }
  };
  

  const handlePageChange = (newPage: number) => {
    // 确保页面不超出范围
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage); // 更新当前页面状态
    fetchData(); // 重新获取数据
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 当搜索词改变时，重置页码为1
  };

  const handleSubmitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1); // 提交搜索时，重置页码为1
  };

  const openModal = (errorItem: ErrorBankItem) => {
    setSelectedErrorItem(errorItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedErrorItem(null);
  };

  // const handleEditClick = (id: number) => {
  //   // 根据实际路由调整
  //   window.location.href = `/errorbank/update?id=${id}`;
  // };
  // if (error) return <div>Error: {error}</div>;

  // render方法中的完整return代码
  return (
    <div className={styles.container}>
      <Home />
      <div className={styles.content}>
        <h1>Error Bank Data</h1>
        <form
          onSubmit={handleSubmitSearch}
          className={styles.searchForm}
        >
          <input
            type="text"
            placeholder="Search by name..."
            value={name}
            onChange={handleSearchInputChange}
            className={styles.searchInput}
          />
          {/* <button type="submit" className={styles.searchButton}>
            Search
          </button> */}
        </form>
        {error && <div className={styles.error}>{error}</div>}
        <table className={styles.errorBankTable}>
          <thead>
            <tr>
              <th>Wrong Name</th>
              <th>Wrong Type</th>
              <th>Wrong Author</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {errorBankData.map((item) => (
              <tr key={item.id}>
                <td>{item.Wrong_name}</td>
                <td>{item.Wrong_type}</td>
                <td>{item.Wrong_author}</td>
                <td>
                  <button
                    onClick={() => openModal(item)}
                    className={styles.actionButton}
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className={styles.paginationButton}
          >
            上一页
          </button>
          <span>当前页面: {currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className={styles.paginationButton}
          >
            下一页
          </button>
        </div>
        {isModalOpen && (
          <ErrorDetailModal
            errorItem={selectedErrorItem}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};
// 使用高阶组件来包装ErrorBankPage
const AuthenticatedErrorBankPage = withAuthentication(ErrorBankPage);

export default AuthenticatedErrorBankPage;