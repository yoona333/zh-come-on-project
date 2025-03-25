import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // 清除所有认证相关的cookie
    cookies().delete('session_id');
    cookies().delete('user_role');
    cookies().delete('user_id');
    
    return NextResponse.json({
      success: true,
      message: '退出登录成功'
    });
  } catch (error) {
    console.error('退出登录错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 