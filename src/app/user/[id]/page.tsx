'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import FollowButton from '@/components/FollowButton';
import { toast } from 'react-toastify';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  role: string;
}

interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  viewCount: number;
  coverImage?: string;
}

export default function UserProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  
  // 加载用户资料
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // 获取用户资料
        const response = await fetch(`/api/user/${id}`);
        
        if (!response.ok) {
          throw new Error('获取用户资料失败');
        }
        
        const data = await response.json();
        setProfile(data.user);
        setStats({
          postsCount: data.postsCount || 0,
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0
        });
        
        // 获取用户文章
        const postsResponse = await fetch(`/api/user/${id}/posts`);
        
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData.posts || []);
        }
      } catch (error) {
        console.error('加载用户资料失败:', error);
        toast.error('加载用户资料失败');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchUserProfile();
    }
  }, [id]);
  
  // 切换标签
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">用户不存在</h1>
        <p className="text-gray-600 mb-6">抱歉，您请求的用户资料不存在或已被删除。</p>
        <Link href="/blog" className="text-blue-600 hover:underline">
          返回博客
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 用户资料卡片 */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            {/* 用户头像 */}
            <div className="w-24 h-24 md:w-32 md:h-32 relative mb-4 md:mb-0 md:mr-6">
              <Image
                src={profile.avatar || 'https://placehold.co/200x200/e2e8f0/475569?text=User'}
                alt={profile.name || '用户'}
                fill
                className="rounded-full object-cover"
              />
            </div>
            
            {/* 用户信息 */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">{profile.name || '未设置昵称'}</h1>
              <p className="text-gray-600 mb-3">{profile.role === 'admin' ? '管理员' : '用户'}</p>
              
              {profile.bio ? (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              ) : (
                <p className="text-gray-500 italic mb-4">该用户还没有填写个人简介</p>
              )}
              
              {/* 统计信息 */}
              <div className="flex justify-center md:justify-start space-x-6 mb-4">
                <div className="text-center">
                  <span className="block font-bold">{stats.postsCount}</span>
                  <span className="text-sm text-gray-500">文章</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold">{stats.followersCount}</span>
                  <span className="text-sm text-gray-500">粉丝</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold">{stats.followingCount}</span>
                  <span className="text-sm text-gray-500">关注</span>
                </div>
              </div>
              
              {/* 关注按钮 - 如果不是当前用户 */}
              {user && user.id !== profile.id && (
                <div className="mt-2">
                  <FollowButton userId={profile.id} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 标签页导航 */}
        <div className="border-t border-gray-200">
          <div className="flex">
            <button
              onClick={() => handleTabChange('posts')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              文章
            </button>
            <button
              onClick={() => handleTabChange('followers')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'followers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              粉丝
            </button>
            <button
              onClick={() => handleTabChange('following')}
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'following'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              关注
            </button>
          </div>
        </div>
      </div>
      
      {/* 标签页内容 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* 文章列表 */}
        {activeTab === 'posts' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">发布的文章</h2>
            
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <h3 className="text-lg font-medium text-blue-600 hover:underline mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {formatDate(post.date)} · {post.viewCount || 0} 次阅读
                      </p>
                      <p className="text-gray-700">{post.description || '暂无描述'}</p>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                该用户还没有发布任何文章
              </p>
            )}
          </div>
        )}
        
        {/* 粉丝列表 */}
        {activeTab === 'followers' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">粉丝列表</h2>
            {/* 粉丝列表内容将通过异步加载 */}
            <p className="text-gray-500 text-center py-8">
              正在开发中...
            </p>
          </div>
        )}
        
        {/* 关注列表 */}
        {activeTab === 'following' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">关注列表</h2>
            {/* 关注列表内容将通过异步加载 */}
            <p className="text-gray-500 text-center py-8">
              正在开发中...
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 