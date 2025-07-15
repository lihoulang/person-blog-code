import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
        <div className="h-1 w-24 bg-blue-600 mx-auto mb-8"></div>
        
        <h2 className="text-3xl font-medium mb-4">页面未找到</h2>
        <p className="text-gray-600 mb-8">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            返回首页
          </Link>
          <Link 
            href="/blog"
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            浏览博客
          </Link>
        </div>
      </div>
    </div>
  );
} 

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
        <div className="h-1 w-24 bg-blue-600 mx-auto mb-8"></div>
        
        <h2 className="text-3xl font-medium mb-4">页面未找到</h2>
        <p className="text-gray-600 mb-8">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            返回首页
          </Link>
          <Link 
            href="/blog"
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            浏览博客
          </Link>
        </div>
      </div>
    </div>
  );
} 