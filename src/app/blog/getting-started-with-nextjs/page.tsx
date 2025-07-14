import Link from 'next/link'

export default function NextJsGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/blog" className="text-blue-600 hover:underline">← 返回博客列表</Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Next.js入门指南</h1>
        <div className="text-gray-600 mb-6">发布于 2025年7月12日</div>
        
        <div className="prose max-w-none mb-8">
          <p>本文将介绍如何开始使用Next.js构建现代化Web应用。</p>
          
          <h2>什么是Next.js</h2>
          
          <p>Next.js是一个React框架，它使得构建生产级别的React应用变得简单。它提供了服务端渲染、静态网站生成、TypeScript支持等众多功能。</p>
          
          <h2>安装</h2>
          
          <p>你可以使用以下命令创建一个新的Next.js项目：</p>
          
          <pre><code>npx create-next-app@latest my-next-app</code></pre>
          
          <p>这个命令会创建一个新的Next.js项目，并安装所有必要的依赖。</p>
          
          <h2>项目结构</h2>
          
          <p>一个基本的Next.js项目结构如下：</p>
          
          <pre><code>my-next-app/
  ├── node_modules/
  ├── public/
  ├── src/
  │   ├── app/
  │   │   ├── page.tsx
  │   │   └── layout.tsx
  │   ├── components/
  │   └── styles/
  ├── next.config.js
  ├── package.json
  ├── tsconfig.json
  └── README.md</code></pre>
          
          <h2>页面路由</h2>
          
          <p>Next.js 13引入了App Router，它使用基于文件系统的路由：</p>
          
          <ul>
            <li><code>src/app/page.tsx</code> - 主页</li>
            <li><code>src/app/about/page.tsx</code> - 关于页面 (/about)</li>
            <li><code>src/app/blog/[slug]/page.tsx</code> - 动态博客文章页面 (/blog/:slug)</li>
          </ul>
          
          <h2>数据获取</h2>
          
          <p>Next.js支持多种数据获取方式：</p>
          
          <ul>
            <li>服务器组件中的异步/await</li>
            <li>静态生成与增量静态再生成(ISR)</li>
            <li>客户端数据获取</li>
          </ul>
          
          <h2>部署</h2>
          
          <p>Next.js应用可以部署到多种平台：</p>
          
          <ul>
            <li>Vercel (Next.js的创建者)</li>
            <li>Netlify</li>
            <li>自托管服务器</li>
            <li>静态导出部署到GitHub Pages等平台</li>
          </ul>
          
          <h2>结论</h2>
          
          <p>Next.js是一个功能强大的React框架，适合构建从简单到复杂的各种Web应用。它的开发体验和性能优化使其成为React开发者的首选工具之一。</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Web开发</span>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">React</span>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Next.js</span>
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