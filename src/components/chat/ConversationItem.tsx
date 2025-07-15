'use client';

import React from 'react';
import Image from 'next/image';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Conversation } from '@/types/chat';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  isActive,
  onClick
}: ConversationItemProps) {
  // 格式化最后消息时间
  const formattedTime = conversation.lastMessageAt
    ? formatDistance(
        new Date(conversation.lastMessageAt),
        new Date(),
        { addSuffix: false, locale: zhCN }
      )
    : '';

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      {/* 用户头像 */}
      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {conversation.otherUser?.avatar ? (
          <Image
            src={conversation.otherUser.avatar}
            alt={conversation.otherUser.name || '用户'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-blue-500 text-white text-lg">
            {conversation.otherUser?.name ? conversation.otherUser.name.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </div>
      
      {/* 对话信息 */}
      <div className="ml-3 flex-grow overflow-hidden">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900 truncate">
            {conversation.otherUser?.name || '未知用户'}
          </h4>
          {formattedTime && (
            <span className="text-xs text-gray-500">{formattedTime}</span>
          )}
        </div>
        
        {/* 最后一条消息预览 */}
        {conversation.lastMessage && (
          <p className="text-sm text-gray-600 truncate mt-1">
            {conversation.lastMessage.content}
          </p>
        )}
      </div>
    </div>
  );
} 