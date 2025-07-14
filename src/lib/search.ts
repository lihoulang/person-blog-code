import * as FlexSearch from 'flexsearch';
import { getAllPosts } from './blog';

let searchIndex: any = null;

export type SearchablePost = {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  slug: string;
};

// 创建搜索索引 - 使用最新的FlexSearch语法
export function createSearchIndex() {
  // @ts-ignore
  const index = new FlexSearch.Document({
    tokenize: 'forward',
    document: {
      id: 'id',
      index: ['title', 'content', 'description', 'tags'],
      store: ['title', 'description', 'slug', 'tags']
    }
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
  posts.forEach(post => {
    // 使用新的API添加文档
    index.add({
      id: post.id,
      title: post.title,
      content: post.content,
      description: post.description,
      tags: Array.isArray(post.tags) ? post.tags.join(' ') : post.tags,
      slug: post.slug,
    });
  });
  
  return index;
}

// 创建并初始化搜索索引
export async function initSearchIndex() {
  const index = createSearchIndex();
  const posts = await getAllPosts();
  
  const searchablePosts = posts.map((post, idx) => ({
    id: idx.toString(),
    title: post.title,
    content: post.content || '',
    description: post.description,
    tags: post.tags,
    slug: post.slug,
  }));
  
  return indexPosts(index, searchablePosts);
}

// 执行搜索查询，根据不同字段设置不同的权重
export async function searchPosts(query: string) {
  const index = await getSearchIndex();
  
  // 搜索多个字段并合并结果
  const titleResults = await index.search(query, {
    index: 'title',
    limit: 20,
    enrich: true
  });
  
  const contentResults = await index.search(query, {
    index: 'content',
    limit: 10,
    enrich: true
  });
  
  const descriptionResults = await index.search(query, {
    index: 'description',
    limit: 10,
    enrich: true
  });
  
  const tagResults = await index.search(query, {
    index: 'tags',
    limit: 20,
    enrich: true
  });
  
  // 合并结果，去重
  const allResults = [
    ...(titleResults[0]?.result || []),
    ...(contentResults[0]?.result || []),
    ...(descriptionResults[0]?.result || []),
    ...(tagResults[0]?.result || [])
  ];
  
  // 对结果进行去重
  const uniqueResults = allResults.filter((result, index, self) =>
    index === self.findIndex(r => r.id === result.id)
  );
  
  // 按相关度排序 (标题和标签匹配排在前面)
  return uniqueResults.sort((a, b) => {
    // 如果在标题中匹配则优先显示
    const aInTitle = titleResults[0]?.result.some(r => r.id === a.id);
    const bInTitle = titleResults[0]?.result.some(r => r.id === b.id);
    if (aInTitle && !bInTitle) return -1;
    if (!aInTitle && bInTitle) return 1;
    
    // 如果在标签中匹配也优先显示
    const aInTags = tagResults[0]?.result.some(r => r.id === a.id);
    const bInTags = tagResults[0]?.result.some(r => r.id === b.id);
    if (aInTags && !bInTags) return -1;
    if (!aInTags && bInTags) return 1;
    
    return 0;
  });
} 