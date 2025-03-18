// 导入依赖
const express = require('express');
const path = require('path');

// 创建一个Express应用程序实例
const app = express();

// 引入JWT(JsonWebToken)中间件
const jwt = require("jsonwebtoken");

 // 定义secret密钥
 const secret = "fwb";

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
    database: 'nodejs_qimo'
  });

connection.connect(err => {
    if (err) {
        console.error('mysql 数据库连接失败:', err);
        return;
    }
    console.log('mysql 数据库连接成功');
});


////

//  // 注册用户
// app.post('/register', (req, res) => {
//   console.log("运行注册:");
//     //从请求体（req.body）中提取用户名和密码的
//     const { username, password } = req.body;

//     // console.log("username:",req.body.username,"password:", req.body.password);
//     //如果用户名或密码为空，则返回错误
//     if (!username || !password) {
//         return res.status(400).send('Username and password are required.');
//     }
//     //使用bcrypt对密码进行加密
//     const hashedPassword = bcrypt.hashSync(password, 8);
//     //将用户名和加密后的密码插入到数据库中
//     const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
//     connection.query(query, [username, hashedPassword], (err, results) => {
//         if (err) {
//             console.error('Error inserting user into database:', err);
//             return res.status(500).send('An error occurred while registering the user.');
//         }
//         res.status(201).send('User registered successfully.');
//     });
// });

 ////
 app.post("/login", (req, res) => {
  console.log("运行登陆:");
    const { username, password } = req.body;            //从请求体中提取用户名和密码
     //如果用户名或密码为空，则返回错误
     if (!username || !password) {return res.status(400).send("用户名和密码为必填项.");}     
   //从数据库中查找用户名对应的记录
   const query = "SELECT * FROM users WHERE username = ?";
  //  console.log("username:",req.body.username,"password:", req.body.password);
  //  console.log("query:",query)
   connection.query(query, [username], (err, results) => {
     if (err) {
       console.error("从数据库提取用户时出错:", err);
       return res.status(500).send("登录时出错.");}
     if (results.length === 0) {return res.status(404).send("未找到用户.");}
     const user = results[0];
    //  const passwordIsValid = bcrypt.compareSync(password, user.password);       //使用bcrypt验证密码是否正确
    const passwordIsValid = password === user.password;
     if (!passwordIsValid) {
        return res.status(401).send("密码无效。"); // 密码错误返回401状态码
    }
    // 用户验证成功，生成token
    const token = jwt.sign({ userId: username }, secret, { expiresIn: 86400 });
    res.status(200).json({ auth: true, token: token }); // 返回JSON响应，包含token
    console.log("token:",token)
   });
 });
 

 ///


// // 错误银行API路由
// app.get('/errorbank', (req, res) => {
//   console.log("运行总错题库:");
//   // 获取查询参数，包括分页和每页记录数
//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 1; // 默认每页10条记录
//   const offset = (page - 1) * limit;

//   // 分页查询
//   const query = 'SELECT Wrong_name, Wrong_content, Wrong_type, Wrong_file, Wrong_author FROM errorbank LIMIT ?, ?';
//   connection.query(query, [offset, limit], (error, results) => {
//     if (error) {
//       return res.status(500).json({ success: false, message: error.message });
//     }

//     // 计算总记录数
//     const totalQuery = 'SELECT COUNT(*) AS total FROM errorbank';
//     connection.query(totalQuery, (err, totalResults) => {
//       if (err) {
//         return res.status(500).json({ success: false, message: err.message });
//       }

//       // 返回数据及分页信息
//       const totalPages = Math.ceil(totalResults[0].total / limit);
//       res.json({
//         success: true,
//         data: results,
//         totalPages: totalPages,
//         currentPage: page
//       });
//     });
//   });
// });

// app.get('/errorbank/zong/:name', (req, res) => {
//   console.log("运行总搜索错题库:");
//   const username = req.params.name;
//   // console.log("username:",username);
//   const pattern = `%${username}%`;
//   // 获取查询参数，包括分页和每页记录数
//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 1; // 默认每页10条记录
//   const offset = (page - 1) * limit;

//   // 分页查询
//   const query = 'SELECT id, Wrong_name, Wrong_content, Wrong_type, Wrong_file, Wrong_author ' +
//   'FROM errorbank ' +
//   'WHERE Wrong_name LIKE ? ' + // 根据作者用户名过滤
//   'LIMIT ?, ?';
//   connection.query(query, [pattern,offset, limit], (error, results) => {
//     // console.log("error:",error);
//     if (error) {
//       return res.status(500).json({ success: false, message: error.message });
//     }

//     // 计算总记录数
//     const totalQuery = 'SELECT COUNT(*) AS total FROM errorbank where Wrong_name LIKE ?';
//     connection.query(totalQuery,[pattern], (err, totalResults) => {
//       if (err) {
//         return res.status(500).json({ success: false, message: err.message });
//       }

//       // 返回数据及分页信息
//       const totalPages = Math.ceil(totalResults[0].total / limit);
//       res.json({
//         success: true,
//         data: results,
//         totalPages: totalPages,
//         currentPage: page
//       });
//     });
//   });
// });

// 使用JWT中间件进行身份验证
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token is invalid or expired.' });
    }

    // 确保JWT中包含userId字段
    if (!decoded.userId) {
      return res.status(401).json({ message: 'User ID not found in token.' });
    }

    // 将用户ID设置在请求对象上
    req.userId = decoded.userId;
    // console.log("req.userId:", req.userId);
    next();
  });
};

// // 错误银行API路由
// app.get('/errorbank/me', verifyToken, (req, res) => {
//   console.log("运行个人错题库:");
//   // 获取查询参数，包括分页和每页记录数
//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 10;
//   const offset = (page - 1) * limit;

//   // 从请求对象中获取用户ID
//   const userId = req.userId;
//   console.log("userId:", userId);

//   // 分页查询，根据错误的作者ID（假设数据库中错误记录关联的是用户ID）
//   const query = 'SELECT id, Wrong_name, Wrong_content, Wrong_type, Wrong_file, Wrong_author ' + // 注意字段名可能需要调整以匹配实际数据库结构
//                 'FROM errorbank ' +
//                 'WHERE Wrong_author = ? ' + // 使用用户ID进行过滤
//                 'LIMIT ?, ?';

//   // console.log("Query:", query);

//   connection.query(query, [userId, offset, limit], (error, results) => {
//     // console.log("Query:", query);
//     // console.log("error1:",error);
//     if (error) {
//       return res.status(500).json({ success: false, message: error.message });
//     }

//     // 计算总记录数
//     const totalQuery = 'SELECT COUNT(*) AS total FROM errorbank WHERE Wrong_author = ?';
//     connection.query(totalQuery, [userId], (err, totalResults) => {
//       // console.log("error2:",error);
//       if (err) {
//         return res.status(500).json({ success: false, message: err.message });
//       }
      

//       // 返回数据及分页信息
//       const totalPages = Math.ceil(totalResults[0].total / limit);
//       // console.log("totalPages:", totalPages);
//       res.json({
//         success: true,
//         data: results,
//         totalPages: totalPages,
//         currentPage: page
//       });
//       // console.log("totalPages:", totalPages);
//       // console.log("currentPage:", page);
//       // console.log("data:", results);
//     });
//   });
// });


// app.post('/errorbank/my/add', verifyToken, (req, res) => {
//   console.log("运行添加个人错题库:");
//   const { Wrong_name, Wrong_content, Wrong_type, Wrong_file} = req.body;
//   // console.log("Wrong_name:", Wrong_name);
//   // console.log("Wrong_content:", Wrong_content);
//   // console.log("Wrong_type:", Wrong_type);
//   // console.log("Wrong_file:", Wrong_file);
//   // console.log("Wrong_author:", Wrong_author);
//   // // 验证数据完整性

//     // 从请求对象中获取用户ID
//     const userId = req.userId;
//     console.log("userId:", userId);

//   const query = 'INSERT INTO errorbank (Wrong_name, Wrong_content, Wrong_type, Wrong_file, Wrong_author) VALUES (?, ?, ?, ?, ?)';
//   connection.query(query, [Wrong_name, Wrong_content, Wrong_type, Wrong_file, userId], (error, results) => {
//     // console.log("error:", error);
//     if (error) {
//     console.log("error1:", error);
//       return res.status(500).json({ success: false, message: error.message });
//     }
//     console.log("error2:", error);

//     res.status(201).json({ success: true, message: 'Error record added successfully', data: { Wrong_id: results.insertId } });
//   });
// });


// app.put('/errorbank/my/update/:id', verifyToken, (req, res) => {
//   console.log("运行修改个人错题库:");
//   const { Wrong_name, Wrong_content, Wrong_type, Wrong_file } = req.body;

//   const id = req.params.id;
//   // console.log("id:", id);

//   let setString = ' SET Wrong_name = ?, Wrong_content = ?, Wrong_type = ?, Wrong_file = ? ';
//   let values = [Wrong_name, Wrong_content, Wrong_type, Wrong_file];

//   // if (req.body.Wrong_author) {
//   //   setString += ', Wrong_author = ?';
//   //   values.push(req.body.Wrong_author);
//   // }

//   const query = `UPDATE errorbank${setString} WHERE id = ?`;
//   connection.query(query, values.concat(id), (error, results) => {
//     if (error) {
//       return res.status(500).json({ success: false, message: error.message });
//     }
//     if (results.affectedRows === 0) {
//       return res.status(404).json({ success: false, message: 'Error record not found' });
//     }
//     res.json({ success: true, message: 'Error record updated successfully' });
//   });
// });

// app.get('/errorbank/me/qu/:name', verifyToken, (req, res) => {
//   console.log("运行查询个人错题库:");
//   // 从请求对象中获取用户ID
//   const userId = req.userId;
//   console.log("userId:", userId);
  
//   // 使用路由参数作为用户名查询
//   const username = req.params.name;

//   // 获取查询参数，包括分页和每页记录数
//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 10;
//   const offset = (page - 1) * limit;

//   console.log("username:", username);

//   // 构建模糊查询的查询字符串
//   // 假设我们使用百分号(%)作为通配符来进行模糊匹配
//   const pattern = `%${username}%`;

//   // 分页查询，根据错误的作者用户名和错误名称进行模糊匹配
//   const query = 'SELECT id, Wrong_name, Wrong_content, Wrong_type, Wrong_file, Wrong_author ' +
//                 'FROM errorbank ' +
//                 'WHERE Wrong_author = ? ' + // 根据作者用户名过滤
//                 'AND Wrong_name LIKE ? ' +   // 根据错误名称进行模糊匹配
//                 'LIMIT ?, ?';

//   console.log("Query:", query);

//   connection.query(query, [userId, pattern, offset, limit], (error, results) => {
//     if (error) {
//       return res.status(500).json({ success: false, message: error.message });
//     }

//     // 计算总记录数
//     // 注意：这里的模糊查询条件也要与上面的查询条件一致
//     const totalQuery = 'SELECT COUNT(*) AS total FROM errorbank WHERE Wrong_author = ? AND Wrong_name LIKE ?';
//     connection.query(totalQuery, [username, pattern], (err, totalResults) => {
//       if (err) {
//         return res.status(500).json({ success: false, message: err.message });
//       }

//       // 返回数据及分页信息
//       const totalPages = Math.ceil(totalResults[0].total / limit);
//       console.log("totalPages:", totalPages);
//       res.json({
//         success: true,
//         data: results,
//         totalPages: totalPages,
//         currentPage: page
//       });
//     });
//   });
// });

// // 受保护的路由
// app.get('/api/me', verifyToken, (req, res) => {
//   console.log("运行后端test:");
//     // 使用用户ID从数据库中获取用户信息
//     const query = 'SELECT username FROM users WHERE id = ?';
//     connection.query(query, [req.userId], (err, results) => {
//         if (err) {
//             console.error('Error fetching user from database:', err);
//             return res.status(500).send('An error occurred while fetching user data.');
//         }
//         // 如果用户不存在，则返回错误
//         if (results.length === 0) {
//             return res.status(404).send('User not found.');
//         }
//         // 返回用户信息
//         res.status(200).send(results[0]);
//     });
// });




////

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






















// 启动服务器(放置最后）
app.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000');
  })
  