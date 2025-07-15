'use client';

import React from 'react';
import BookmarkButton from './BookmarkButton';
import LikeButton from './LikeButton';

interface PostActionsProps {
  postId: number | string;
}

export default function PostActions({ postId }: PostActionsProps) {
  // 确保postId是字符串
  const postIdString = typeof postId === 'number' ? postId.toString() : postId;

  return (
    <div className="flex space-x-4 items-center mt-6">
      {/* 点赞按钮 */}
      <div className="flex items-center space-x-1 px-4 py-2 rounded-full border bg-gray-50 border-gray-200 hover:bg-gray-100">
        <LikeButton postId={postIdString} className="mr-1" />
        <span>点赞</span>
      </div>

      {/* 收藏按钮 */}
      <div className="flex items-center space-x-1 px-4 py-2 rounded-full border bg-gray-50 border-gray-200 hover:bg-gray-100">
        <BookmarkButton postId={postIdString} className="mr-1" />
        <span>收藏</span>
      </div>
    </div>
  );
} 