'use client';

import React from 'react';
import Image from 'next/image';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface MessageItemProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  isRead?: boolean;
}

export default function MessageItem({
  content,
  timestamp,
  isOwn,
  senderName,
  senderAvatar,
  isRead
}: MessageItemProps) {
  // 格式化时间为"xx分钟前"
  const formattedTime = formatDistance(
    new Date(timestamp),
    new Date(),
    { addSuffix: true, locale: zhCN }
  );

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* 发送者头像 - 仅在非自己发送的消息显示 */}
      {!isOwn && (
        <div className="flex-shrink-0 mr-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {senderAvatar ? (
              <Image
                src={senderAvatar}
                alt={senderName || '用户'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-blue-500 text-white text-lg">
                {senderName ? senderName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* 发送者名称 - 仅在非自己发送的消息显示 */}
        {!isOwn && senderName && (
          <span className="text-xs text-gray-500 mb-1">{senderName}</span>
        )}
        
        {/* 消息内容 */}
        <div className={`rounded-lg px-4 py-2 inline-block ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
        
        {/* 时间和已读状态 */}
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span>{formattedTime}</span>
          {isOwn && (
            <span className="ml-2">
              {isRead ? (
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l-4.5-4.5 1.5-1.5L9 9l7.5-7.5 1.5 1.5L9 12z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l-4.5-4.5 1.5-1.5L9 9l7.5-7.5 1.5 1.5L9 12z" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
      
      {/* 自己的头像 - 仅在自己发送的消息显示 */}
      {isOwn && (
        <div className="flex-shrink-0 ml-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {senderAvatar ? (
              <Image
                src={senderAvatar}
                alt="我"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-green-500 text-white text-lg">
                我
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 