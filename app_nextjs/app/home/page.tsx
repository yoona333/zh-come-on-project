"use client";


// Home.tsx
import React from 'react';
import { Typography, Card } from 'antd'; // 导入antd组件
import Home from '../homedaohan/page'; // 引入Sidebar组件
import styles from '../css/home.module.css';


const { Title, Text } = Typography;
const { Meta } = Card;

const Home_2: React.FC = () => {
  return (
    <div className={styles.container}>
      <Home />
      
      <div className={styles.title}>
        <Title level={1}>错题库管理系统</Title>
        <Text style={{ margin: '16px 0', textAlign: 'center' }}>
          一个帮助学生整理和复习学习中遇到的难题的工具。
        </Text>
      </div>

      <div className={styles.cardContainer}>
        <Card
          hoverable
          className={styles.card}
        >
          <Meta
            title="项目架构"
            description={
              <>
                <Text strong>前端：</Text> React.js / next.js（或类似框架）、antd / Material-UI（或类似UI库）等。
                <br />
                <Text strong>后端：</Text> Express、Node.js内置模块、MySQL模块等。
                <br />
                <Text strong>数据库：</Text> MySQL、MongoDB等。
              </>
            }
          />
        </Card>

        <Card
          hoverable
          className={styles.card}
        >
          <Meta
            title="简介"
            description={
              <>
                错题库管理系统旨在帮助用户高效管理学习过程中的错题。用户可以轻松添加错题，查看错题的详细信息，并通过分页功能浏览大量的错题。系统还支持用户注册和登录，以及通过检索功能快速找到特定的错题。
              </>
            }
          />
        </Card>
      </div>
    </div>
  );
};

export default Home_2;