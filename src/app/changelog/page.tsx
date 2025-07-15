import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

export const metadata = {
  title: '更新日志 - 个人博客',
  description: '了解个人博客项目的开发历史、功能更新和版本迭代'
};

export default async function ChangelogPage() {
  // 读取CHANGELOG.md文件
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const changelogContent = fs.readFileSync(changelogPath, 'utf8');
  
  // 将Markdown转换为HTML
  const htmlContent = marked(changelogContent);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  首页
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">更新日志</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">更新日志</h1>
        
        <div className="prose prose-lg max-w-none mb-10">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
        
        <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-700 mb-2">项目历程</h2>
          <p className="text-gray-700">
            查看更多项目规划和即将推出的功能，请访问
            <Link 
              href="/roadmap" 
              className="text-blue-600 hover:underline ml-1"
            >
              项目规划
            </Link>
            页面。
          </p>
        </div>
      </div>
    </div>
  );
} 