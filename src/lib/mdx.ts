import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

// 内容目录路径
const POSTS_PATH = path.join(process.cwd(), 'content/posts');
const AUTHORS_PATH = path.join(process.cwd(), 'content/authors');

// 定义博客文章元数据类型
export interface PostMetadata {
  id: string;
  slug: string;
  title: string;
  date: string;
  formattedDate?: string;
  description?: string;
  content?: string;
  tags?: string[];
  coverImage?: string;
  author?: string;
  viewCount?: number;
}

// 定义文章和作者的类型
export interface PostFrontMatter {
  title: string;
  description: string;
  date: string;
  author: string;
  slug: string;
  tags: string[];
  published: boolean;
  [key: string]: any;
}

export interface AuthorFrontMatter {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  [key: string]: any;
}

export interface Post {
  slug: string;
  frontMatter: PostFrontMatter;
  content?: any;
}

export interface Author {
  slug: string;
  frontMatter: AuthorFrontMatter;
  content?: any;
}

// 获取所有文章的slugs
export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(POSTS_PATH);
  return fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map(fileName => ({
      params: {
        slug: fileName.replace(/\.mdx$/, ''),
      },
    }));
}

// 获取所有作者的slugs
export function getAllAuthorSlugs() {
  const fileNames = fs.readdirSync(AUTHORS_PATH);
  return fileNames
    .filter(fileName => fileName.endsWith('.mdx'))
    .map(fileName => ({
      params: {
        slug: fileName.replace(/\.mdx$/, ''),
      },
    }));
}

// 获取指定slug的文章内容
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(POSTS_PATH, `${slug}.mdx`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const mdxSource = await serialize(content);
    
    return {
      slug,
      frontMatter: data as PostFrontMatter,
      content: mdxSource,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

// 获取指定slug的作者信息
export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const fullPath = path.join(AUTHORS_PATH, `${slug}.mdx`);
  
  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    const mdxSource = await serialize(content);
    
    return {
    slug,
      frontMatter: data as AuthorFrontMatter,
      content: mdxSource,
    };
  } catch (error) {
    console.error(`Error reading author ${slug}:`, error);
    return null;
  }
}

// 获取所有文章，按日期排序
export async function getAllPosts(): Promise<Post[]> {
  const fileNames = fs.readdirSync(POSTS_PATH);
  const allPostsData = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.mdx'))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(POSTS_PATH, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        const { data } = matter(fileContents);
        
        return {
          slug,
          frontMatter: data as PostFrontMatter,
        };
      })
  );
  
  // 按日期排序
  return allPostsData
    .filter(post => post.frontMatter.published !== false) // 只返回已发布的文章
    .sort((a, b) => {
      if (a.frontMatter.date < b.frontMatter.date) {
        return 1;
      } else {
        return -1;
      }
    });
}

// 根据标签筛选文章
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => 
    post.frontMatter.tags && 
    Array.isArray(post.frontMatter.tags) && 
    post.frontMatter.tags.includes(tag)
  );
}

// 获取所有标签
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const tagsSet = new Set<string>();
  
  allPosts.forEach(post => {
    if (post.frontMatter.tags && Array.isArray(post.frontMatter.tags)) {
      post.frontMatter.tags.forEach((tag: string) => tagsSet.add(tag));
    }
  });
  
  return Array.from(tagsSet);
}

// 搜索文章
export async function searchPosts(query: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  const searchTerms = query.toLowerCase().split(' ');
  
  return allPosts.filter(post => {
    const title = post.frontMatter.title?.toLowerCase() || '';
    const description = post.frontMatter.description?.toLowerCase() || '';
    // 内容搜索需要更复杂的处理，这里简化处理
    
    return searchTerms.some(term => 
      title.includes(term) || 
      description.includes(term)
    );
  });
} 