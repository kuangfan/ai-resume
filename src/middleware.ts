// /src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // 定义公开路由
  const publicPaths = ['/', '/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);
  const isAuthPath = pathname.startsWith('/api/auth') || pathname === '/api/register';
  const isStaticPath = pathname.startsWith('/_next') || pathname.includes('.');

  // 跳过验证的路径
  if (isPublicPath || isAuthPath || isStaticPath) {
    return NextResponse.next();
  }

  // 需要登录
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|.*\\.png$).*)'],
};