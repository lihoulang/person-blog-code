'use client';

import React, { useState, useEffect } from 'react';
import BookmarkButton from './BookmarkButton';
import LikeButton from './LikeButton';
import ContactAuthorButton from './ContactAuthorButton';

interface PostActionsProps {
  postId: number | string;
}

export default function PostActions({ postId }: PostActionsProps) {
  // 确保postId是字符串
  const postIdString = typeof postId === 'number' ? postId.toString() : postId;
  const [authorId, setAuthorId] = useState<string | null>(null);

  // 获取文章作者ID
  useEffect(() => {
    const fetchPostAuthor = async () => {
      try {
        const response = await fetch(`/api/blog/posts/${postIdString}/author`);
        if (response.ok) {
          const data = await response.json();
          setAuthorId(data.authorId.toString());
        }
      } catch (error) {
        console.error('获取作者信息失败:', error);
      }
    };

    fetchPostAuthor();
  }, [postIdString]);

  return (
    <div className="flex flex-wrap items-center gap-4 mt-6">
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

      {/* 联系作者按钮 */}
      {authorId && (
        <div className="flex items-center space-x-1 px-4 py-2 rounded-full border bg-gray-50 border-gray-200 hover:bg-gray-100">
          <ContactAuthorButton authorId={authorId} />
        </div>
      )}
    </div>
  );
} 