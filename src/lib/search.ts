import { Document } from 'flexsearch';
import { getAllPosts } from './blog';

// 搜索索引的缓存
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
  // 使用Document API，而不是Index API
  const index = new Document({
    document: {
      id: 'id',
      index: [
        'title',
        'content',
        'description',
        'tags'
      ]
    },
    tokenize: 'forward'
  });
  
  return index;
}

// 获取或初始化搜索索引
export async function getSearchIndex() {
  if (searchIndex) {
    return searchIndex;
  }
  
  searchIndex = await initSearchIndex();
  return searchIndex;
}

// 将文章添加到搜索索引中
export function indexPosts(index: any, posts: SearchablePost[]) {
  posts.forEach((post) => {
    // 准备用于索引的文档对象
    const doc = {
      id: post.id,
      title: post.title,
      content: post.content || '',
      description: post.description || '',
      tags: post.tags ? post.tags.join(' ') : ''
    };
    
    // 添加到索引
    index.add(doc);
  });
  
  return { index, posts };
}

// 初始化搜索索引
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
export async function searchPosts(query: string): Promise<SearchablePost[]> {
  try {
    const { index, posts } = await getSearchIndex();
    
    // 在多个字段中搜索
    const titleResults = await index.search(query, { index: 'title', limit: 10 });
    const contentResults = await index.search(query, { index: 'content', limit: 10 });
    const descResults = await index.search(query, { index: 'description', limit: 5 });
    const tagResults = await index.search(query, { index: 'tags', limit: 5 });
    
    // 合并所有结果
    const allResults = [...titleResults, ...contentResults, ...descResults, ...tagResults];
    
    // 去重处理
    const resultIds = new Set<string>();
    const resultPosts: SearchablePost[] = [];
    
    for (const resultSet of allResults) {
      if (resultSet.result && resultSet.result.length > 0) {
        for (const id of resultSet.result) {
          if (!resultIds.has(id)) {
            resultIds.add(id);
            const post = posts.find((p: SearchablePost) => p.id === id);
            if (post) {
              resultPosts.push(post);
            }
          }
        }
      }
    }
    
    return resultPosts;
  } catch (error) {
    console.error('搜索出错:', error);
    return [];
  }
} 