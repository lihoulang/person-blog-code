import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于 - 个人博客',
  description: '关于我和这个博客',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">关于我</h1>
      
      <div className="prose">
        <p className="mb-4">
          欢迎来到我的个人博客！我是一名热爱技术和写作的开发者。
          这个博客是我分享知识、经验和想法的地方。
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">博客目的</h2>
        <p className="mb-4">
          创建这个博客的目的是：
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>分享技术经验和见解</li>
          <li>记录学习过程和成长</li>
          <li>与志同道合的人交流想法</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">技术栈</h2>
        <p className="mb-4">
          这个博客使用以下技术构建：
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Next.js - React框架</li>
          <li>TypeScript - 类型安全的JavaScript</li>
          <li>Tailwind CSS - 实用优先的CSS框架</li>
          <li>MDX - 支持JSX的Markdown扩展</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">联系我</h2>
        <p>
          如果你有任何问题或建议，欢迎通过以下方式联系我：
        </p>
        <ul className="list-disc pl-6">
          <li>Email: 819317636@qq.com</li>
          <li>GitHub: <a href="https://github.com/username" className="text-blue-600 hover:underline">github.com/username</a></li>
        </ul>
      </div>
    </div>
  )
} 