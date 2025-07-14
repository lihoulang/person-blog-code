'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Comment {
  id: number;
  content: string;
  isApproved: boolean;
  createdAt: string;
  authorId: number | null;
  guestName: string | null;
  guestEmail: string | null;
  postId: number;
  post: {
    title: string;
    slug: string;
  };
  author: {
    name: string;
  } | null;
}

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // all, approved, unapproved
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从URL参数中获取初始过滤和排序状态
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    const sortParam = searchParams.get('sort');

    if (filterParam && ['all', 'approved', 'unapproved'].includes(filterParam)) {
      setFilter(filterParam);
    }

    if (sortParam && ['newest', 'oldest'].includes(sortParam)) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  // 获取评论列表
  useEffect(() => {
    async function fetchComments() {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        if (filter !== 'all') {
          queryParams.append('filter', filter);
        }
        if (sortBy) {
          queryParams.append('sort', sortBy);
        }

        const response = await fetch(`/api/admin/comments?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('获取评论列表失败');
        }

        const data = await response.json();
        setComments(data);
      } catch (err) {
        console.error('获取评论列表出错:', err);
        setError('获取评论列表失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    }

    fetchComments();
  }, [filter, sortBy]);

  // 更新URL参数
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    if (filter !== 'all') {
      params.append('filter', filter);
    }
    if (sortBy !== 'newest') {
      params.append('sort', sortBy);
    }

    const queryString = params.toString();
    router.push(`/admin/comments${queryString ? `?${queryString}` : ''}`);
  };

  // 处理过滤和排序变化
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    setTimeout(updateUrlParams, 0);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setTimeout(updateUrlParams, 0);
  };

  // 审核评论
  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isApproved: true,
        }),
      });

      if (!response.ok) {
        throw new Error('审核评论失败');
      }

      // 更新列表中的评论状态
      setComments(comments.map(comment => 
        comment.id === id ? { ...comment, isApproved: true } : comment
      ));
    } catch (err) {
      console.error('审核评论出错:', err);
      alert('审核评论失败，请稍后重试');
    }
  };

  // 拒绝评论
  const handleReject = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isApproved: false,
        }),
      });

      if (!response.ok) {
        throw new Error('拒绝评论失败');
      }

      // 更新列表中的评论状态
      setComments(comments.map(comment => 
        comment.id === id ? { ...comment, isApproved: false } : comment
      ));
    } catch (err) {
      console.error('拒绝评论出错:', err);
      alert('拒绝评论失败，请稍后重试');
    }
  };

  // 删除评论
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条评论吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除评论失败');
      }

      // 从列表中移除已删除的评论
      setComments(comments.filter(comment => comment.id !== id));
    } catch (err) {
      console.error('删除评论出错:', err);
      alert('删除评论失败，请稍后重试');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">评论管理</h1>
      </div>

      {/* 筛选工具栏 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-4">
            <div>
              <select
                value={filter}
                onChange={handleFilterChange}
                className="px-4 py-2 border rounded-md bg-white"
              >
                <option value="all">所有评论</option>
                <option value="approved">已审核</option>
                <option value="unapproved">待审核</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 border rounded-md bg-white"
              >
                <option value="newest">最新评论</option>
                <option value="oldest">最早评论</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg">没有找到符合条件的评论</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">
                      {comment.author ? comment.author.name : comment.guestName || '匿名用户'}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      comment.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comment.isApproved ? '已审核' : '待审核'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {comment.guestEmail && `Email: ${comment.guestEmail}`}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    发表于: {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!comment.isApproved && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      通过
                    </button>
                  )}
                  {comment.isApproved && (
                    <button
                      onClick={() => handleReject(comment.id)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      撤回
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="mt-2 p-3 bg-gray-50 rounded">
                {comment.content}
              </div>

              <div className="mt-3 text-sm">
                <span className="text-gray-600">文章: </span>
                <Link 
                  href={`/blog/${comment.post.slug}`}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  {comment.post.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 