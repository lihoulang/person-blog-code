'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Message, Conversation } from '@/types/chat';
import MessageItem from './MessageItem';
import { toast } from 'react-toastify';
import { useSocket } from '@/hooks/useSocket';

interface ChatBoxProps {
  conversation: Conversation;
  onMessageSent?: () => void;
}

export default function ChatBox({ conversation, onMessageSent }: ChatBoxProps) {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 加载消息
  useEffect(() => {
    if (conversation?.id) {
      fetchMessages();
    }
  }, [conversation?.id]);
  
  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 监听新消息
  useEffect(() => {
    if (!conversation?.id) return;

    // 监听来自此对话的新消息
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversation.id) {
        setMessages(prev => [...prev, message]);
      }
    };

    // 注册Socket事件监听
    const unsubscribe = on('new_message', handleNewMessage);

    // 清理函数
    return () => {
      off('new_message', handleNewMessage);
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [conversation?.id, on, off]);

  // 获取对话消息
  const fetchMessages = async () => {
    if (!conversation?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('获取消息失败');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('获取消息错误:', error);
      toast.error('加载消息失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 发送消息
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !conversation?.id || !user?.id || !conversation.otherUser?.id) return;
    
    try {
      setSending(true);
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: inputValue.trim(),
          receiverId: conversation.otherUser.id
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('发送消息失败');
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setInputValue('');
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('发送消息错误:', error);
      toast.error('发送消息失败，请重试');
    } finally {
      setSending(false);
    }
  };
  
  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* 聊天头部 */}
      <div className="p-4 border-b flex items-center">
        <h3 className="font-semibold text-lg">
          {conversation?.otherUser?.name || '未知用户'}
        </h3>
      </div>
      
      {/* 消息区域 */}
      <div className="flex-grow overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 h-full flex items-center justify-center">
            <p>暂无消息，发送第一条消息开始对话吧！</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                content={message.content}
                timestamp={message.createdAt}
                isOwn={message.senderId === user?.id?.toString()}
                senderName={message.senderId === user?.id?.toString() ? undefined : conversation?.otherUser?.name}
                senderAvatar={message.senderId === user?.id?.toString() ? user?.avatar : conversation?.otherUser?.avatar}
                isRead={message.isRead}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* 输入区域 */}
      <div className="p-3 border-t">
        <form onSubmit={sendMessage} className="flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入消息..."
            className="flex-grow p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            className={`ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              sending ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={sending || !inputValue.trim()}
          >
            {sending ? '发送中...' : '发送'}
          </button>
        </form>
      </div>
    </div>
  );
} 