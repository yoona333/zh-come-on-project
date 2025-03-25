import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;
  
  // 登录页面和公共API不需要验证
  if (pathname === '/login' || pathname === '/' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // 检查是否有会话ID
  if (!sessionId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 检查路径是否与角色匹配
  if (pathname.startsWith('/admin') && userRole !== '2') {
    // 如果不是管理员，重定向到登录页面
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (pathname.startsWith('/student') && userRole !== '1' && userRole !== '3') {
    // 如果不是学生或社长，重定向到登录页面
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api/public).*)',
  ],
}; 