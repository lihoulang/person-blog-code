export interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  description: string;
  content?: string;
  tags: string[];
  author: string;
  viewCount: number;
  matchScore?: number; // 用于相关文章匹配
} 