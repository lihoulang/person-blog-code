export interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  content?: string;
  description?: string;
  tags?: string[];
  author?: string;
  viewCount?: number;
  coverImage?: string;
} 