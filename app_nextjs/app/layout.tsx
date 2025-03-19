"use client";

import React from 'react';
import Link from 'next/link';
import './style.css';

interface NavLink {
  name: string;
  href: string;
  subLinks?: Array<{
    name: string;
    href: string;
  }>;
}

interface RootLayoutProps {
  children?: React.ReactNode;
}

class RootLayout extends React.Component<RootLayoutProps, { activeDropdown: string | null }> {
  constructor(props: RootLayoutProps) {
    super(props);
    this.state = {
      activeDropdown: null,
    };
  }

  toggleDropdown = (linkHref: string) => {
    this.setState((prevState) => ({
      activeDropdown: prevState.activeDropdown === linkHref ? null : linkHref,
    }));
  }

  render() {
    const { children } = this.props;
    const { activeDropdown } = this.state;
    const navLinks: NavLink[] = [
      // ... your nav links with subLinks
    ];

    return (
      <html lang="zh">
        <head>
          <title>我的网站</title>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body>
          <nav>
            {navLinks.map((link) => {
              const dropdownActive = activeDropdown === link.href;
              return (
                <div key={link.name} className="nav-item">
                  <button
                    className="nav-link"
                    onClick={() => this.toggleDropdown(link.href)}
                  >
                    {link.name}
                  </button>
                  {dropdownActive && (
                    <div className="dropdown">
                      {link.subLinks &&
                        link.subLinks.map((subLink, index) => (
                          <div key={index}>
                            <Link href={subLink.href} key={subLink.name}>
                              <a>{subLink.name}</a>
                            </Link>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          {children}
        </body>
      </html>
    );
  }
}

export default RootLayout;
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
