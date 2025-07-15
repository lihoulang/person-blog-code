'use client';

import Link from 'next/link';

interface Post {
  id: string | number;
  title: string;
  slug: string;
  viewCount: number;
}

interface TopPostsTableProps {
  posts: Post[];
}

export default function TopPostsTable({ posts }: TopPostsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3">排名</th>
            <th className="px-4 py-3">文章标题</th>
            <th className="px-4 py-3 text-right">阅读量</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
          ) : (
            posts.map((post, index) => (
              <tr key={post.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className={`
                    inline-flex items-center justify-center w-6 h-6 rounded-full
                    ${index < 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    {index + 1}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600 hover:underline"
                    target="_blank"
                  >
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right">
                  {post.viewCount.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 