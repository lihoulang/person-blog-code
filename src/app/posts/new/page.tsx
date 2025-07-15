import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

// 强制此路由为动态路由
export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  try {
    // 验证用户是否已登录并具有管理权限
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      // 未登录，重定向到登录页面
      redirect('/auth/login?redirectTo=/posts/new');
    }

    // 验证令牌
    const jwtSecret = process.env.JWT_SECRET || '';
    const decoded = verify(token, jwtSecret) as any;
    
    // 检查是否为管理员
    if (!decoded || decoded.role !== 'admin') {
      // 无权限，重定向到首页
      redirect('/');
    }
    
    // 重定向到管理后台的文章创建页面
    redirect('/admin/posts/new');
  } catch (error) {
    // 令牌验证失败，重定向到登录页面
    redirect('/auth/login?redirectTo=/posts/new');
  }
} 