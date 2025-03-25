import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './style.css';
import { AntdProvider } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '攒劲Π校内活动积分系统',
  description: '校内社团活动管理与积分系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <AntdProvider>
          {children}
        </AntdProvider>
      </body>
    </html>
  );
}

// "use client";

// // home.tsx
// import styles from './css/home.module.css';
// import React, { useState } from 'react';

// const Home: React.FC = () => {
//   const [activeMenu, setActiveMenu] = useState('');

//   const handleClick = (menu: string) => {
//     setActiveMenu(prevMenu => (prevMenu === menu ? '' : menu));
//   };

//     // 处理退出按钮点击的函数
//     const handleLogout = () => {
//       // 清除 localStorage 中的 token
//       localStorage.removeItem('token');
//       // 可以在这里添加额外的逻辑，例如重定向到登录页面
//     };

//   return (
//     <div className={styles.container}>
//       <h1>错题库管理系统</h1>
//       <aside className={styles.sidebar}>
//         <nav>
//           <ul>
//             <li>
//               <button 
//                 className={styles.menuButton} 
//                 onClick={() => handleClick('totalErrorLibrary')}
//               >
//                 错题库管理系统
//               </button>
//               {activeMenu === 'totalErrorLibrary' && (
//                 <ul className={styles.dropdownMenu}>
//                   <li>
//                     <a href="/errorbank">总错题库数据列表</a>
//                   </li>
//                 </ul>
//               )}
//             </li>
//             <li>
//               <button 
//                 className={styles.menuButton} 
//                 onClick={() => handleClick('myErrorLibrary')}
//               >
//                 我的错题库
//               </button>
//               {activeMenu === 'myErrorLibrary' && (
//                 <ul className={styles.dropdownMenu}>
//                   <li>
//                     <a href="/myerrorbank">我的错题库数据列表</a>
//                   </li>
//                   <li>
//                     <a href="/myerrorbank/add">添加错题</a>
//                   </li>
//                   {/* <li>
//                     <a href="/#">删除错题</a>
//                   </li>
//                   <li>
//                     <a href="/myerrorbank/update">修改错题</a>
//                   </li>
//                   <li>
//                     <a href="/#">批量删除错题</a>
//                   </li>
//                   <li>
//                     <a href="/#">文件上传</a>
//                   </li> */}
//                 </ul>
//               )}
//             </li>
//             <li>
//               <button 
//                 className={styles.menuButton} 
//                 onClick={() => handleClick('personalInfo')}
//               >
//                 个人信息管理
//               </button>
//               {activeMenu === 'personalInfo' && (
//                 <ul className={styles.dropdownMenu}>
//                   <li>
//                     <a href="/#">编辑个人信息</a>
//                   </li>
//                 </ul>
//               )}
//                     <button onClick={handleLogout} className={styles.logoutButton}>
//         退出
//       </button>
//             </li>
//           </ul>
//         </nav>
//       </aside>
//         {/* 主要内容区域 */}
//     </div>
//   );
// };

// export default Home;
