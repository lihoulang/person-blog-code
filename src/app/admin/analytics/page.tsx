import { Metadata } from 'next';
import { getTotalViewStats, getViewGrowthStats } from '@/lib/analytics';
import { getAllPosts } from '@/lib/blog';
import AnalyticsOverview from '@/components/admin/AnalyticsOverview';
import PostViewsChart from '@/components/admin/PostViewsChart';
import TopPostsTable from '@/components/admin/TopPostsTable';
import AdminLayout from '@/components/admin/AdminLayout';

export const metadata: Metadata = {
  title: '阅读统计分析 - 管理后台',
  description: '查看博客文章的阅读统计和分析数据',
};

export default async function AnalyticsPage() {
  // 获取统计数据
  const { totalViews, topPosts } = await getTotalViewStats();
  const { currentMonthViews, previousMonthViews, growthRate } = await getViewGrowthStats();
  
  // 获取所有文章
  const posts = await getAllPosts();
  
  // 计算平均阅读量
  const avgViewsPerPost = posts.length > 0 
    ? Math.round(totalViews / posts.length) 
    : 0;
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">阅读统计分析</h1>
        
        {/* 概览卡片 */}
        <AnalyticsOverview 
          totalViews={totalViews}
          totalPosts={posts.length}
          avgViewsPerPost={avgViewsPerPost}
          growthRate={growthRate}
          currentMonthViews={currentMonthViews}
          previousMonthViews={previousMonthViews}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* 阅读趋势图表 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">阅读趋势</h2>
            <PostViewsChart />
          </div>
          
          {/* 热门文章表格 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">热门文章</h2>
            <TopPostsTable posts={topPosts} />
          </div>
        </div>
        
        {/* 文章阅读详情 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">文章阅读详情</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">文章标题</th>
                  <th className="px-4 py-3">发布日期</th>
                  <th className="px-4 py-3">阅读量</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{post.title}</td>
                    <td className="px-4 py-3">{new Date(post.date).toLocaleDateString('zh-CN')}</td>
                    <td className="px-4 py-3">{post.viewCount || 0}</td>
                    <td className="px-4 py-3">
                      <a 
                        href={`/admin/analytics/posts/${post.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        详情
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 