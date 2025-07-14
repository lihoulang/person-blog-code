import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Comment, CreateCommentRequest } from '../types/comment'

// 评论存储目录
const COMMENTS_DIR = path.join(process.cwd(), 'src/content/comments')

// 确保评论目录存在
function ensureCommentsDir() {
  if (!fs.existsSync(COMMENTS_DIR)) {
    fs.mkdirSync(COMMENTS_DIR, { recursive: true })
  }
}

// 获取评论文件路径
function getCommentsFilePath(slug: string) {
  ensureCommentsDir()
  return path.join(COMMENTS_DIR, `${slug}.json`)
}

// 获取文章的所有评论
export function getCommentsBySlug(slug: string): Comment[] {
  try {
    const filePath = getCommentsFilePath(slug)
    
    if (!fs.existsSync(filePath)) {
      return []
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error(`获取评论失败 (${slug}):`, error)
    return []
  }
}

// 保存评论
function saveComments(slug: string, comments: Comment[]) {
  const filePath = getCommentsFilePath(slug)
  fs.writeFileSync(filePath, JSON.stringify(comments, null, 2))
}

// 创建评论
export function createComment(commentData: CreateCommentRequest): Comment {
  const { slug, name, email, content, parentId } = commentData
  
  // 获取现有评论
  const comments = getCommentsBySlug(slug)
  
  // 创建新评论
  const newComment: Comment = {
    id: uuidv4(),
    slug,
    name,
    email,
    content,
    createdAt: new Date().toISOString(),
    parentId
  }
  
  // 将新评论添加到评论列表
  comments.push(newComment)
  
  // 保存评论
  saveComments(slug, comments)
  
  return newComment
}

// 组织评论为嵌套结构
export function organizeCommentsHierarchy(comments: Comment[]): Comment[] {
  const rootComments: Comment[] = []
  const commentMap: Record<string, Comment> = {}
  
  // 首先创建所有评论的映射
  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] }
  })
  
  // 然后将回复评论添加到其父评论的replies数组中
  comments.forEach(comment => {
    if (comment.parentId && commentMap[comment.parentId]) {
      // 这是一个回复评论
      if (!commentMap[comment.parentId].replies) {
        commentMap[comment.parentId].replies = []
      }
      commentMap[comment.parentId].replies!.push(commentMap[comment.id])
    } else {
      // 这是一个根评论
      rootComments.push(commentMap[comment.id])
    }
  })
  
  return rootComments
}

// 删除评论
export function deleteComment(slug: string, commentId: string): boolean {
  try {
    const comments = getCommentsBySlug(slug)
    const filteredComments = comments.filter(comment => comment.id !== commentId)
    
    // 如果评论数量不变，说明没有找到要删除的评论
    if (comments.length === filteredComments.length) {
      return false
    }
    
    saveComments(slug, filteredComments)
    return true
  } catch (error) {
    console.error(`删除评论失败 (${slug}, ${commentId}):`, error)
    return false
  }
} 