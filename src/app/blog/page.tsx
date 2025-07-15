import Link from 'next/link'

// 设置为服务端渲染
export const dynamic = 'force-dynamic';

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">博客文章</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="space-y-8">
          <article className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">
              <Link href="/blog/hello-world" className="text-blue-600 hover:underline">
                你好，世界！
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">2025年7月13日</p>
            <p className="text-gray-700 mb-4">我的第一篇博客文章</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">技术</span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">生活</span>
            </div>
            <Link href="/blog/hello-world" className="text-blue-600 hover:underline">
              阅读全文 →
            </Link>
          </article>
          
          <article className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">
              <Link href="/blog/getting-started-with-nextjs" className="text-blue-600 hover:underline">
                Next.js入门指南
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">2025年7月12日</p>
            <p className="text-gray-700 mb-4">了解如何使用Next.js构建现代化Web应用</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Web开发</span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">React</span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Next.js</span>
            </div>
            <Link href="/blog/getting-started-with-nextjs" className="text-blue-600 hover:underline">
              阅读全文 →
            </Link>
          </article>
        </div>
      </div>
    </div>
  )
} 