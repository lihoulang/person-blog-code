import { Index } from 'flexsearch';
import { getAllPosts } from './blog';

let searchIndex: any = null;

export type SearchablePost = {
  id: string;
  title: string;
  content: string;
  description: string | undefined;
  tags: string[] | undefined;
  slug: string;
};

// 创建搜索索引
export function createSearchIndex() {
  const index = new Index({
    tokenize: 'forward',
    preset: 'match'
  });
  
  return index;
}

// 缓存搜索索引，避免重复初始化
export async function getSearchIndex() {
  if (searchIndex) {
    return searchIndex;
  }
  
  searchIndex = await initSearchIndex();
  return searchIndex;
}

// 将文章添加到搜索索引中
export function indexPosts(index: any, posts: SearchablePost[]) {
  posts.forEach((post, idx) => {
    // 添加标题
    index.add(idx, post.title);
    
    // 添加内容
    if (post.content) {
      index.add(`content_${idx}`, post.content);
    }
    
    // 添加描述
    if (post.description) {
      index.add(`desc_${idx}`, post.description);
    }
    
    // 添加标签
    if (post.tags && post.tags.length > 0) {
      index.add(`tags_${idx}`, post.tags.join(' '));
    }
  });
  
  return { index, posts };
}

// 创建并初始化搜索索引
export async function initSearchIndex() {
  const index = createSearchIndex();
  const posts = await getAllPosts();
  
  const searchablePosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content || '',
    description: post.description,
    tags: post.tags,
    slug: post.slug,
  }));
  
  return indexPosts(index, searchablePosts);
}

// 执行搜索查询
export async function searchPosts(query: string) {
  const { index, posts } = await getSearchIndex();
  
  // 搜索
  const results = index.search(query);
  
  // 处理结果
  const resultIds = new Set();
  const resultPosts = [];
  
  // 处理搜索结果
  for (const id of results) {
    const numericId = parseInt(String(id).replace(/^(content|desc|tags)_/, ''));
    
    if (!resultIds.has(numericId)) {
      resultIds.add(numericId);
      resultPosts.push(posts[numericId]);
    }
  }
  
  return resultPosts;
} 