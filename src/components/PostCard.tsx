import Link from 'next/link';
import Image from 'next/image';
import { PostMetadata } from '@/lib/mdx';

interface PostCardProps {
  post: PostMetadata;
  showImage?: boolean;
}

export default function PostCard({ post, showImage = true }: PostCardProps) {
  // 封面图片URL（如果文章没有提供，则使用默认图片）
  const coverImage = post.coverImage || '/images/default-post-cover.jpg';
  
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      {showImage && (
        <div className="relative h-48 w-full">
          <Image
            src={coverImage}
            alt={post.title}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false}
            // 添加占位符和错误处理
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            onError={() => {
              // 如果图片加载失败，会显示默认的模糊图像
              console.log('图片加载失败:', post.title);
            }}
          />
        </div>
      )}
      
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-2 line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition">
            {post.title}
          </Link>
        </h2>
        
        <div className="text-gray-500 text-sm mb-3">{post.formattedDate || post.date}</div>
        
        <p className="text-gray-700 mb-4 line-clamp-3">{post.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags?.map((tag: string) => (
            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div>
          <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline text-sm font-medium">
            阅读全文 →
          </Link>
        </div>
      </div>
    </article>
  );
} 