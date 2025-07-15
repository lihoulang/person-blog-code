import { redirect } from 'next/navigation';

export default function PostsPage() {
  // 重定向到博客页面
  redirect('/blog');
} 