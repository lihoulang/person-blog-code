import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">欢迎来到我的个人博客</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">最新文章</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/blog/hello-world" className="text-blue-600 hover:underline">
                你好，世界！
              </Link>
              <p className="text-gray-600 text-sm mt-1">我的第一篇博客文章</p>
            </li>
            <li>
              <Link href="/blog/getting-started-with-nextjs" className="text-blue-600 hover:underline">
                Next.js入门指南
              </Link>
              <p className="text-gray-600 text-sm mt-1">了解如何使用Next.js构建现代化Web应用</p>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">标签</h2>
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">技术</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">生活</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Web开发</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">React</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Next.js</span>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Link href="/about" className="text-blue-600 hover:underline">
          关于我
        </Link>
        <span className="mx-4">|</span>
        <Link href="/blog" className="text-blue-600 hover:underline">
          浏览所有文章
        </Link>
      </div>
    </div>
  )
} 