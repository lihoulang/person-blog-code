import Link from 'next/link'

export default function HelloWorldPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/blog" className="text-blue-600 hover:underline">← 返回博客列表</Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">你好，世界！</h1>
        <div className="text-gray-600 mb-6">发布于 2025年7月13日</div>
        
        <div className="prose max-w-none mb-8">
          <p>这是我的第一篇博客文章。欢迎来到我的个人博客！</p>
          
          <p>在这个博客中，我将分享我的思考、学习笔记和经验。</p>
          
          <h2>为什么创建这个博客？</h2>
          
          <p>创建这个博客的目的是：</p>
          
          <ul>
            <li>记录我的学习历程</li>
            <li>分享有用的知识和经验</li>
            <li>与志同道合的人交流想法</li>
          </ul>
          
          <h2>未来计划</h2>
          
          <p>我计划定期更新这个博客，分享技术相关的文章、生活感悟等内容。如果你有任何问题或建议，欢迎与我联系！</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">技术</span>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">生活</span>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">分享这篇文章</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-blue-600 hover:underline">Twitter</a>
            <a href="#" className="text-blue-600 hover:underline">Facebook</a>
            <a href="#" className="text-blue-600 hover:underline">LinkedIn</a>
          </div>
        </div>
      </article>
    </div>
  )
} 