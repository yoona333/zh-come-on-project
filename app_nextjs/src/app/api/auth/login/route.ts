import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mysql from 'mysql2/promise';

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'come-on-project',
};

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json();
    
    // 连接数据库
    const connection = await mysql.createConnection(dbConfig);
    
    // 查询用户
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    // 关闭连接
    await connection.end();
    
    // 检查用户是否存在
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    const user = rows[0] as any;
    
    // 验证用户角色
    let userRole = '';
    if (user.role === 1) userRole = 'student';
    else if (user.role === 2) userRole = 'admin';
    else if (user.role === 3) userRole = 'student'; // 社长也使用学生界面，但有额外权限
    
    // 检查角色是否匹配
    if ((role === 'admin' && user.role !== 2) || 
        (role === 'student' && user.role !== 1 && user.role !== 3)) {
      return NextResponse.json(
        { success: false, message: '用户角色不匹配' },
        { status: 403 }
      );
    }
    
    // 创建会话ID
    const sessionId = crypto.randomUUID();
    
    // 设置cookie
    cookies().set({
      name: 'session_id',
      value: sessionId,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 一周
    });
    
    // 设置用户角色cookie
    cookies().set({
      name: 'user_role',
      value: String(user.role),
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 一周
    });
    
    // 设置用户ID cookie
    cookies().set({
      name: 'user_id',
      value: String(user.id),
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 一周
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: userRole,
        isClubLeader: user.role === 3
      }
    });
    
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 