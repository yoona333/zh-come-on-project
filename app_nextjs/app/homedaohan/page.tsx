// Home.tsx
import React, { useState } from 'react';
import styles from '../css/home.module.css';

const Home: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('');

  const handleClick = (menu: string) => {
    setActiveMenu(prevMenu => (prevMenu === menu ? '' : menu));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>
        <h1>错题库管理系统</h1>
      </div>
      <ul className={styles.menuList}>
        <li>
          <a href="/errorbank" className={styles.menuButton}>总错题库</a>
        </li>
        <li>
          <div className={styles.dropdown}>
            <button className={styles.menuButton}>
              我的错题库
            </button>
            <ul className={styles.dropdownMenu}>
              <li><a href="/myerrorbank">数据列表</a></li>
              <li><a href="/myerrorbank/add">添加错题</a></li>
              {/* 可以根据需要添加更多二级菜单项 */}
            </ul>
          </div>
        </li>
        <li>
          <div className={styles.dropdown}>
            <button className={styles.menuButton}>
              个人信息管理
            </button>
            <ul className={styles.dropdownMenu}>
              <li><a href="/personalinfo">编辑个人信息</a></li>
              {/* 可以根据需要添加更多二级菜单项 */}
            </ul>
          </div>
        </li>
        <li>
          <button className={styles.logoutButton} onClick={handleLogout}>
            退出
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Home;