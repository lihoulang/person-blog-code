'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  author: {
    name: string;
  };
  _count: {
    comments: number;
  };
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, views
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从URL参数中获取初始过滤和排序状态
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    const sortParam = searchParams.get('sort');
    const searchParam = searchParams.get('search');

    if (filterParam && ['all', 'published', 'draft'].includes(filterParam)) {
      setFilter(filterParam);
    }

    if (sortParam && ['newest', 'oldest', 'views'].includes(sortParam)) {
      setSortBy(sortParam);
    }

    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  // 获取文章列表
  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        if (filter !== 'all') {
          queryParams.append('filter', filter);
        }
        if (sortBy) {
          queryParams.append('sort', sortBy);
        }
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }

        const response = await fetch(`/api/admin/posts?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('获取文章列表失败');
        }

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error('获取文章列表出错:', err);
        setError('获取文章列表失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [filter, sortBy, searchTerm]);

  // 更新URL参数
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    if (filter !== 'all') {
      params.append('filter', filter);
    }
    if (sortBy !== 'newest') {
      params.append('sort', sortBy);
    }
    if (searchTerm) {
      params.append('search', searchTerm);
    }

    const queryString = params.toString();
    router.push(`/admin/posts${queryString ? `?${queryString}` : ''}`);
  };

  // 处理搜索提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams();
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

  // 删除文章
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除文章失败');
      }

      // 从列表中移除已删除的文章
      setPosts(posts.filter(post => post.id !== id));
    } catch (err) {
      console.error('删除文章出错:', err);
      alert('删除文章失败，请稍后重试');
    }
  };

  // 切换文章发布状态
  const togglePublishStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          published: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('更新文章状态失败');
      }

      // 更新列表中的文章状态
      setPosts(posts.map(post => 
        post.id === id ? { ...post, published: !currentStatus } : post
      ));
    } catch (err) {
      console.error('更新文章状态出错:', err);
      alert('更新文章状态失败，请稍后重试');
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
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Link 
          href="/admin/posts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <span className="mr-2">✚</span> 新建文章
        </Link>
      </div>

      {/* 搜索和筛选工具栏 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索文章标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-md pr-10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                🔍
              </button>
            </div>
          </form>

          <div className="flex gap-4">
            <div>
              <select
                value={filter}
                onChange={handleFilterChange}
                className="px-4 py-2 border rounded-md bg-white"
              >
                <option value="all">所有文章</option>
                <option value="published">已发布</option>
                <option value="draft">草稿</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 border rounded-md bg-white"
              >
                <option value="newest">最新发布</option>
                <option value="oldest">最早发布</option>
                <option value="views">浏览量</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg">没有找到符合条件的文章</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">浏览量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评论数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.published ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.author.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.viewCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post._count.comments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="text-blue-600 hover:text-blue-900"
                          target="_blank"
                        >
                          查看
                        </Link>
                        <Link 
                          href={`/admin/posts/${post.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => togglePublishStatus(post.id, post.published)}
                          className={`${
                            post.published 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {post.published ? '取消发布' : '发布'}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 