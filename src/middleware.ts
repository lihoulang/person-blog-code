import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// 需要认证的路径
const protectedPaths = [
  '/api/posts',
  '/api/users',
  '/admin',
]

// 检查路径是否需要保护
function isProtectedPath(path: string): boolean {
  return protectedPaths.some(prefix => path.startsWith(prefix))
}

// 从请求中提取路径
function extractPath(request: NextRequest): string {
  return request.nextUrl.pathname
}

export async function middleware(request: NextRequest) {
  const path = extractPath(request)

  // 对公开路径，放行请求
  if (!isProtectedPath(path)) {
    return NextResponse.next()
  }

  // 获取请求中的令牌
  const authHeader = request.headers.get('authorization')
  // 尝试从cookie中获取令牌
  const cookies = request.cookies.get('auth_token')
  const token = authHeader?.split(' ')[1] || cookies?.value || null

  // 如果没有提供令牌，返回401未授权错误
  if (!token) {
    // 如果是API请求，返回JSON响应
    if (path.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: '未授权访问' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    // 如果是页面请求，重定向到登录页
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    // 验证令牌
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET || process.env.JWT_SECRET
    )
    
    // 如果没有配置密钥，返回服务器错误
    if (!process.env.AUTH_SECRET && !process.env.JWT_SECRET) {
      console.error('认证密钥未配置，请设置环境变量AUTH_SECRET或JWT_SECRET')
      return new NextResponse(
        JSON.stringify({ error: '服务器配置错误' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
    )
    }
    
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch (error) {
    // 令牌无效或已过期
    if (path.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: '无效的令牌' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    // 如果是页面请求，重定向到登录页
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

// 仅为特定路径配置中间件
export const config = {
  matcher: [
    '/api/posts/:path*',
    '/api/users/:path*',
    '/admin/:path*',
  ],
} 