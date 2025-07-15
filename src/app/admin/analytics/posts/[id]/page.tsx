import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostById } from '@/lib/blog';
import { getPostViewStats } from '@/lib/analytics';
import AdminLayout from '@/components/admin/AdminLayout';
import PostViewsChart from '@/components/admin/PostViewsChart';

interface PostAnalyticsPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PostAnalyticsPageProps): Promise<Metadata> {
  const post = await getPostById(Number(params.id));
  
  if (!post) {
    return {
      title: '文章不存在 - 阅读统计',
    };
  }
  
  return {
    title: `${post.title} - 阅读统计`,
  };
}

export default async function PostAnalyticsPage({ params }: PostAnalyticsPageProps) {
  const postId = Number(params.id);
  const post = await getPostById(postId);
  
  if (!post) {
    notFound();
  }
  
  const { totalViews } = await getPostViewStats(postId);
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link 
            href="/admin/analytics" 
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回阅读统计
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <p className="text-gray-500 mb-4">
            发布于 {new Date(post.date).toLocaleDateString('zh-CN')}
          </p>
          
          <div className="flex items-center">
            <div className="mr-8">
              <span className="text-sm text-gray-500">总阅读量</span>
              <div className="text-3xl font-bold">{totalViews}</div>
            </div>
            
            <Link 
              href={`/blog/${post.slug}`} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              target="_blank"
            >
              查看文章
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 阅读趋势图表 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">阅读趋势</h2>
            <PostViewsChart />
          </div>
          
          {/* 来源分析 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">阅读来源</h2>
            <div className="text-center text-gray-500 py-12">
              数据收集中...
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">阅读者设备统计</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">桌面设备</h3>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">移动设备</h3>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">平板设备</h3>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 