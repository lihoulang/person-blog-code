import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

export const metadata = {
  title: '项目规划 - 个人博客',
  description: '了解个人博客项目的开发规划、即将推出的功能和修复计划'
};

export default async function RoadmapPage() {
  // 读取ROADMAP.md文件
  const roadmapPath = path.join(process.cwd(), 'ROADMAP.md');
  const roadmapContent = fs.readFileSync(roadmapPath, 'utf8');
  
  // 将Markdown转换为HTML
  const htmlContent = marked(roadmapContent);
  
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
                  <span className="text-gray-500">项目规划</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">项目规划</h1>
        
        <div className="prose prose-lg max-w-none mb-10">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
        
        <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-700 mb-2">参与贡献</h2>
          <p className="text-gray-700">
            如果您对项目有任何建议或想法，欢迎在 
            <a 
              href="https://github.com/lihoulang/person-blog-code/issues" 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Issues
            </a> 
            上提出，或直接联系博客管理员。
          </p>
        </div>
      </div>
    </div>
  );
} 