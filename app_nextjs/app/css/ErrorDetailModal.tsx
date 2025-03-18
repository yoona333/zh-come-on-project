// ErrorDetailModal.tsx
import React from 'react';
// import { ErrorBankItem } from '../errorbank/page'; // 确保这个路径指向你的接口定义文件

// 直接在组件文件中定义接口
interface ErrorBankItem {
    id: number;
    Wrong_name: string;
    Wrong_content: string;
    Wrong_type: string;
    Wrong_file: string;
    Wrong_author: string;
  }

interface ErrorDetailModalProps {
  errorItem: ErrorBankItem | null;
  onClose: () => void;
}

const ErrorDetailModal: React.FC<ErrorDetailModalProps> = ({ errorItem, onClose }) => {
  if (!errorItem) return null; // 如果errorItem为null，则不渲染模态框

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="close" onClick={onClose} style={{ color: 'white', fontSize: '40px' }}>
          &times;
        </span>
        <h2>错题详情</h2>
        <p>
          <strong>错题名称:</strong> {errorItem.Wrong_name}
        </p>
        <p>
          <strong>错题内容:</strong> {errorItem.Wrong_content}
        </p>
        <p>
          <strong>错题类型:</strong> {errorItem.Wrong_type}
        </p>
        <p>
          <strong>错题文件:</strong> {errorItem.Wrong_file}
        </p>
        <p>
          <strong>错题作者:</strong> {errorItem.Wrong_author}
        </p>
      </div>
    </div>
  );
};

export default ErrorDetailModal;