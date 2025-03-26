// 导入依赖
const express = require('express');
const path = require('path');

// 创建一个Express应用程序实例
const app = express();

// 引入JWT(JsonWebToken)中间件
const jwt = require("jsonwebtoken");

 // 定义secret密钥
 const secret = "zanjin";

//用于连接数据库
const mysql = require('mysql2');
//用于对密码进行加密
const bcrypt = require('bcryptjs');

// 引入body-parser中间件，用于解析请求体
const bodyParser = require("body-parser");

/////
const cors = require("cors");
// const express = require("express");
// const app = express();
app.use(cors());


//////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// 设置静态文件目录
app.use(express.static(path.join(__dirname)));


////

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'come-on-project'
  });

connection.connect(err => {
    if (err) {
        console.error('mysql 数据库连接失败:', err);
        return;
    }
    console.log('mysql 数据库连接成功');
});

// 使用JWT中间件进行身份验证
// const verifyToken = (req, res, next) => {
//   const token = req.headers['x-access-token'];
//   if (!token) {
//     return res.status(401).json({ message: 'No token provided.' });
//   }

//   jwt.verify(token, secret, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: 'Token is invalid or expired.' });
//     }

//     // 确保JWT中包含userId字段
//     if (!decoded.userId) {
//       return res.status(401).json({ message: 'User ID not found in token.' });
//     }

//     // 将用户ID设置在请求对象上
//     req.userId = decoded.userId;
//     // console.log("req.userId:", req.userId);
//     next();
//   });
// };

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  console.log('Received token:', token); // 添加日志
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err); // 添加日志
      return res.status(401).json({ message: 'Token is invalid or expired.' });
    }

    if (!decoded.userId) {
      return res.status(401).json({ message: 'User ID not found in token.' });
    }

    req.userId = decoded.userId;
    next();
  });
};


//  app.post("/login", (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).send("用户名和密码为必填项.");
//   }

//    const query = "SELECT * FROM users WHERE username = ?";
//    connection.query(query, [username], (err, results) => {
//      if (err) {
//        console.error("从数据库提取用户时出错:", err);
//       return res.status(500).send("登录时出错.");
//     }
//     if (results.length === 0) {
//       return res.status(404).send("未找到用户.");
//     }
//      const user = results[0];
//     const passwordIsValid = password === user.password;
//      if (!passwordIsValid) {
//       return res.status(401).send("密码无效。");
//     }

//     const token = jwt.sign({ id: user.id }, secret, { expiresIn: 86400 });
//     res.status(200).send({ success: true, token });
//    });
//  });

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("用户名和密码为必填项.");
  }

  // 修改查询语句，加入 role 字段
  const query = "SELECT id, password, role FROM users WHERE username = ?";
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error("从数据库提取用户时出错:", err);
      return res.status(500).send("登录时出错.");
    }
    if (results.length === 0) {
      return res.status(404).send("未找到用户.");
    }
    const user = results[0];
    const passwordIsValid = password === user.password;
    if (!passwordIsValid) {
      return res.status(401).send("密码无效。");
    }

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: 86400 });
    // 在响应中加入 role 字段
    res.status(200).send({ success: true, token, role: user.role });
    console.log("生成的 token:", token);
  });
});

// ... existing code ...

// 处理忘记密码请求的路由
app.post('/Forgot/password' ,(req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).send("用户名是必填项.");
  }

  // 更新用户的 is_forgotten 字段为 1
  const query = "UPDATE users SET is_forgotten = 1 WHERE username = ?";
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error("更新用户忘记密码状态时出错:", err);
      return res.status(500).send("处理忘记密码请求时出错.");
    }
    if (results.affectedRows === 0) {
      return res.status(404).send("未找到用户.");
    }
    res.status(200).send({ success: true, message: '重置密码申请已提交，请等待处理。' });
  });
});


// 处理重置密码请求的路由
// 路由 1: 查看 users 表中的 is_forgotten 为 1 的 username
app.get('/ischange/password',verifyToken,  (req, res) => {
  const query = 'SELECT username FROM users WHERE is_forgotten = 1';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('查询忘记密码用户列表失败:', err);
      return res.status(500).json({ error: '查询忘记密码用户列表失败' });
    }
    const usernames = results.map(row => row.username);
    res.json(usernames);
  });
});

// 路由 2: 修改对应的 username 的 is_forgotten 为 0，password 修改为 000000
app.post('/ischange/password',verifyToken,  (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: '缺少必要的参数: username' });
  }
  const query = 'UPDATE users SET is_forgotten = 0, password = "000000" WHERE username = ?';
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('重置用户密码失败:', err);
      return res.status(500).json({ error: '重置用户密码失败' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: '未找到用户' });
    }
    res.json({ message: `用户 ${username} 密码重置成功` });
  });
});

// 处理注册请求的路由

// 提供 HTML 页面
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// app.get('/register', (req, res) => {
//     res.sendFile(path.join(__dirname, 'register.html'));
// });

app.get('/me', (req, res) => {
    res.sendFile(path.join(__dirname, 'me.html'));
});


////

// 活动管理API
// 获取所有活动
app.get('/activities', verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT a.*, c.name as club_name, u.username as organizer  
    FROM activities a
    JOIN clubs c ON a.club_id = c.id
    JOIN users u ON a.created_by = u.id
    ORDER BY a.date DESC
    LIMIT ?, ?
  `;
  
  const countQuery = `SELECT COUNT(*) as total FROM activities`;
  
  connection.query(query, [offset, limit], (error, results) => {
    if (error) {
      console.error('Activities query error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
    
    connection.query(countQuery, (err, countResults) => {
      if (err) {
        console.error('Count query error:', err);
        return res.status(500).json({ success: false, message: err.message });
      }
      
      const totalPages = Math.ceil(countResults[0].total / limit);
      
      console.log('Returning activities data:', results); // 添加日志确认返回的数据
      
      res.json({
        success: true,
        data: results,
        totalPages: totalPages,
        currentPage: page
      });
    });
  });
});

// ... existing code ...

// 获取我的活动
app.get('/my/activities', verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const userId = req.userId; // 从token中获取userid

  // 查询用户报名的活动ID
  const getActivityIdsQuery = `
    SELECT activity_id FROM signups WHERE user_id = ?
  `;

  connection.query(getActivityIdsQuery, [userId], (error, activityIdsResults) => {
    if (error) {
      console.error('获取活动ID时出错:', error);
      return res.status(500).json({ success: false, message: '获取活动ID时出错' });
    }

    if (activityIdsResults.length === 0) {
      return res.json({
        success: true,
        data: [],
        totalPages: 0,
        currentPage: page
      });
    }

    const activityIds = activityIdsResults.map(result => result.activity_id);
    const placeholders = activityIds.map(() => '?').join(',');

    // 查询活动信息
    const query = `
      SELECT a.*, c.name as club_name, u.username as organizer  
      FROM activities a
      JOIN clubs c ON a.club_id = c.id
      JOIN users u ON a.created_by = u.id
      WHERE a.id IN (${placeholders})
      ORDER BY a.date DESC
      LIMIT ?, ?
    `;

    const countQuery = `SELECT COUNT(*) as total FROM activities WHERE id IN (${placeholders})`;

    const queryParams = [...activityIds, offset, limit];
    const countQueryParams = [...activityIds];

    connection.query(query, queryParams, (error, results) => {
      if (error) {
        console.error('Activities query error:', error);
        return res.status(500).json({ success: false, message: error.message });
      }

      connection.query(countQuery, countQueryParams, (err, countResults) => {
        if (err) {
          console.error('Count query error:', err);
          return res.status(500).json({ success: false, message: err.message });
        }

        const totalPages = Math.ceil(countResults[0].total / limit);

        console.log('Returning activities data:', results);

        res.json({
          success: true,
          data: results,
          totalPages: totalPages,
          currentPage: page
        });
      });
    });
  });
});

// ... existing code ...


// 创建活动
app.post('/activities', verifyToken, (req, res) => {
  const userId = req.userId; // 从 JWT 中获取

  // 通过 userId 获取对应的 role
  const getRoleQuery = 'SELECT role FROM users WHERE id = ?';
  connection.query(getRoleQuery, [userId], (err, results) => {
    if (err) {
      console.error('从数据库获取用户角色时出错:', err);
      return res.status(500).send('获取用户角色时出错.');
    }
    if (results.length === 0) {
      return res.status(404).send('未找到用户.');
    }
    const userRole = results[0].role;

    // 检查 role 是否为 0
    if (userRole!== 0) {
      return res.status(403).json({ success: false, message: '用户角色不为 0，无权限创建活动' });
    }

    // 从请求体中获取数据，新增 tags 和 contact 字段
    const { title, description, date, location, points, club_id, tags, contact, participant_count_max } = req.body;

    // 验证必填字段
    if (!title || !date || !club_id) {
      return res.status(400).json({ success: false, message: '标题、日期和社团 ID 为必填项' });
    }

    // 插入数据，新增 tags 和 contact 字段
    const query = `
      INSERT INTO activities (title, description, date, location, points, club_id, created_by, tags, contact, participant_count_max)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
      query, 
      [title, description, date, location, points, club_id, userId, tags, contact,participant_count_max],
      (error, results) => {
        if (error) {
          return res.status(500).json({ success: false, message: error.message });
        }

        res.status(201).json({
          success: true,
          message: '活动创建成功',
          data: { id: results.insertId }
        });
      }
    );
  });
});

// ... existing code ...

// ... existing code ...

// 参加活动
app.post('/activities/:activityId/signup', verifyToken, (req, res) => {
  const activityId = req.params.activityId;
  const userId = req.userId; // 从 JWT 中获取用户 ID

  // 先查询活动的最大参与人数和当前参与人数
  const queryActivity = 'SELECT participant_count_max, participant_count FROM activities WHERE id = ?';
  connection.query(queryActivity, [activityId], (activityError, activityResults) => {
    if (activityError) {
      console.error('查询活动信息时出错:', activityError);
      return res.status(500).json({ success: false, message: '查询活动信息时出错' });
    }

    if (activityResults.length === 0) {
      return res.status(404).json({ success: false, message: '未找到该活动' });
    }

    const { participant_count_max, participant_count } = activityResults[0];

    // 检查是否达到最大参与人数
    if (participant_count >= participant_count_max) {
      return res.status(400).json({ success: false, message: '该活动已达到最大参与人数，无法报名' });
    }

    // 检查用户是否已经报名该活动
    const checkQuery = 'SELECT * FROM signups WHERE activity_id = ? AND user_id = ?';
    connection.query(checkQuery, [activityId, userId], (checkError, checkResults) => {
      if (checkError) {
        console.error('检查用户报名状态时出错:', checkError);
        return res.status(500).json({ success: false, message: '检查报名状态时出错' });
      }

      if (checkResults.length > 0) {
        return res.status(400).json({ success: false, message: '您已经报名了这个活动' });
      }

      // 插入报名记录
      const insertQuery = 'INSERT INTO signups (activity_id, user_id) VALUES (?, ?)';
      connection.query(insertQuery, [activityId, userId], (insertError, insertResults) => {
        if (insertError) {
          console.error('报名活动时出错:', insertError);
          return res.status(500).json({ success: false, message: '报名活动时出错' });
        }

        // 更新活动的参与人数
        const updateQuery = 'UPDATE activities SET participant_count = participant_count + 1 WHERE id = ?';
        connection.query(updateQuery, [activityId], (updateError, updateResults) => {
          if (updateError) {
            console.error('更新活动参与人数时出错:', updateError);
            return res.status(500).json({ success: false, message: '更新活动参与人数时出错' });
          }

          res.json({ success: true, message: '报名成功' });
        });
      });
    });
  });
});

// ... existing code ...

// ... existing code ...

// 退出活动
app.post('/activities/:activityId/withdraw', verifyToken, (req, res) => {
  const activityId = req.params.activityId;
  const userId = req.userId; // 从 JWT 中获取用户 ID

  // 检查用户是否已经报名该活动
  const checkQuery = 'SELECT * FROM signups WHERE activity_id = ? AND user_id = ?';
  connection.query(checkQuery, [activityId, userId], (checkError, checkResults) => {
    if (checkError) {
      console.error('检查用户报名状态时出错:', checkError);
      return res.status(500).json({ success: false, message: '检查报名状态时出错' });
    }

    if (checkResults.length === 0) {
      return res.status(400).json({ success: false, message: '您没有报名这个活动，无法退出' });
    }

    // 删除报名记录
    const deleteQuery = 'DELETE FROM signups WHERE activity_id = ? AND user_id = ?';
    connection.query(deleteQuery, [activityId, userId], (deleteError, deleteResults) => {
      if (deleteError) {
        console.error('退出活动时出错:', deleteError);
        return res.status(500).json({ success: false, message: '退出活动时出错' });
      }

      // 若删除报名记录成功，将活动的参与人数减一
      const updateQuery = 'UPDATE activities SET participant_count = participant_count - 1 WHERE id = ?';
      connection.query(updateQuery, [activityId], (updateError, updateResults) => {
        if (updateError) {
          console.error('更新活动参与人数时出错:', updateError);
          return res.status(500).json({ success: false, message: '更新活动参与人数时出错' });
        }

        res.json({ success: true, message: '退出活动成功' });
      });
    });
  });
});

// ... existing code ...



// // 参加活动
// app.post('/activities/:id/join', verifyToken, (req, res) => {
//   const activityId = req.params.id;
//   const userId = req.userId;
  
//   // 检查用户是否已经参加了该活动
//   const checkQuery = `
//     SELECT * FROM activity_participants 
//     WHERE activity_id = ? AND user_id = ?
//   `;
  
//   connection.query(checkQuery, [activityId, userId], (error, results) => {
//     if (error) {
//       return res.status(500).json({ success: false, message: error.message });
//     }
    
//     if (results.length > 0) {
//       return res.status(400).json({ 
//         success: false, 
//         message: '您已经参加了这个活动' 
//       });
//     }
    
//     // 插入参与记录
//     const insertQuery = `
//       INSERT INTO activity_participants (activity_id, user_id)
//       VALUES (?, ?)
//     `;
    
//     connection.query(insertQuery, [activityId, userId], (err, result) => {
//       if (err) {
//         return res.status(500).json({ success: false, message: err.message });
//       }
      
//       res.json({
//         success: true,
//         message: '成功参加活动',
//         data: { id: result.insertId }
//       });
//     });
//   });
// });

// 积分管理API
// 分配积分
app.post('/points/assign', verifyToken, (req, res) => {
  // 验证用户是否有权限分配积分（管理员或社长）
  const checkRoleQuery = `SELECT role FROM users WHERE id = ?`;
  
  connection.query(checkRoleQuery, [req.userId], (error, results) => {
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const userRole = results[0].role;
    if (userRole !== 'admin' && userRole !== 'leader') {
      return res.status(403).json({ 
        success: false, 
        message: '您没有权限分配积分' 
      });
    }
    
    // 从请求体中获取数据
    const { user_id, activity_id, points, description } = req.body;
    
    // 验证必填字段
    if (!user_id || !points) {
      return res.status(400).json({ 
        success: false, 
        message: '用户ID和积分为必填项' 
      });
    }
    
    // 插入积分记录
    const insertQuery = `
      INSERT INTO points (user_id, activity_id, points, description, assigned_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    connection.query(
      insertQuery, 
      [user_id, activity_id, points, description, req.userId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }
        
        res.json({
          success: true,
          message: '积分分配成功',
          data: { id: result.insertId }
        });
      }
    );
  });
});

// 获取积分排行榜
app.get('/points/leaderboard', verifyToken, (req, res) => {
  // 查询每个用户的总积分
  const query = `
    SELECT u.id, u.username, c.name as club_name, 
           COALESCE(SUM(p.points), 0) as total_points
    FROM users u
    LEFT JOIN clubs c ON u.club_id = c.id
    LEFT JOIN points p ON u.id = p.user_id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY total_points DESC
    LIMIT 20
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.json({
      success: true,
      data: results
    });
  });
});

// 获取个人积分历史
app.get('/points/history', verifyToken, (req, res) => {
  const userId = req.userId;
  
  const query = `
    SELECT p.*, a.title as activity_title, u.username as assigned_by_name
    FROM points p
    LEFT JOIN activities a ON p.activity_id = a.id
    LEFT JOIN users u ON p.assigned_by = u.id
    WHERE p.user_id = ?
    ORDER BY p.assigned_at DESC
  `;
  
  connection.query(query, [userId], (error, results) => {
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    res.json({
      success: true,
      data: results
    });
  });
});

////






















// 启动服务器(放置最后）
app.listen(3001, () => {
    console.log('服务器运行在 http://localhost:3001');
  })
  