import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // 清除认证cookie
  cookies().delete('auth_token');
  
  return NextResponse.json({
    message: '成功退出登录'
  });
}
