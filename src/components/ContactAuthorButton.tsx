'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

interface ContactAuthorButtonProps {
  authorId: string;
  className?: string;
}

export default function ContactAuthorButton({ authorId, className = '' }: ContactAuthorButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 处理联系作者
  const handleContact = async () => {
    if (!user) {
      // 未登录，跳转到登录页
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (user.id.toString() === authorId) {
      toast.info('不能与自己聊天');
      return;
    }

    try {
      setLoading(true);
      
      // 创建或获取与作者的对话
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: authorId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('创建对话失败');
      }

      const data = await response.json();
      
      // 跳转到消息页面
      router.push(`/profile/messages?conversation=${data.conversation.id}`);
    } catch (error) {
      console.error('联系作者失败:', error);
      toast.error('联系作者失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className={`flex items-center text-blue-600 hover:text-blue-800 ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      <svg 
        className="w-5 h-5 mr-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
        />
      </svg>
      {loading ? '连接中...' : '联系作者'}
    </button>
  );
} 