// 评论接口
export interface Comment {
  id: string
  slug: string
  name: string
  email?: string
  content: string
  createdAt: string
  replies?: Comment[]
  parentId?: string
}

// 创建评论的请求数据
export interface CreateCommentRequest {
  slug: string
  name: string
  email?: string
  content: string
  parentId?: string
}

// 评论响应数据
export interface CommentResponse {
  comment: Comment
  message: string
} 