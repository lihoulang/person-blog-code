'use client';

interface AnalyticsOverviewProps {
  totalViews: number;
  totalPosts: number;
  avgViewsPerPost: number;
  growthRate: number;
  currentMonthViews: number;
  previousMonthViews: number;
}

export default function AnalyticsOverview({
  totalViews,
  totalPosts,
  avgViewsPerPost,
  growthRate,
  currentMonthViews,
  previousMonthViews
}: AnalyticsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 总阅读量 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-1">总阅读量</h3>
        <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
        <div className="mt-2 flex items-center text-sm">
          <span className={`inline-flex items-center ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growthRate >= 0 ? (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {Math.abs(growthRate)}%
          </span>
          <span className="ml-2 text-gray-500">与上月相比</span>
        </div>
      </div>
      
      {/* 本月阅读量 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-1">本月阅读量</h3>
        <p className="text-2xl font-bold">{currentMonthViews.toLocaleString()}</p>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500">上月: {previousMonthViews.toLocaleString()}</span>
        </div>
      </div>
      
      {/* 文章数量 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-1">文章数量</h3>
        <p className="text-2xl font-bold">{totalPosts.toLocaleString()}</p>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500">平均阅读量: {avgViewsPerPost}/篇</span>
        </div>
      </div>
      
      {/* 平均阅读量 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 mb-1">平均阅读量</h3>
        <p className="text-2xl font-bold">{avgViewsPerPost.toLocaleString()}</p>
        <div className="mt-2 flex items-center text-sm">
          <span className="text-gray-500">每篇文章</span>
        </div>
      </div>
    </div>
  );
} 