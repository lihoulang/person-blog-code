'use client'

import { useEffect } from 'react'

interface PostViewTrackerProps {
  postId: string | number
}

export default function PostViewTracker({ postId }: PostViewTrackerProps) {
  // 在组件挂载时记录文章阅读
  useEffect(() => {
    // 使用会话存储判断该会话是否已经记录了阅读
    const sessionKey = `viewed_post_${postId}`
    
    // 确保sessionStorage可用（服务器端渲染时不可用）
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const hasViewed = sessionStorage.getItem(sessionKey)
      
      if (!hasViewed) {
        // 发送API请求记录阅读
        const recordView = async () => {
          try {
            // 确保用户已在页面停留至少5秒才记录阅读
            await new Promise(resolve => setTimeout(resolve, 5000))
            
            const response = await fetch('/api/analytics/view', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ postId: String(postId) }),
            })
            
            if (response.ok) {
              // 在会话存储中记录已阅读
              sessionStorage.setItem(sessionKey, 'true')
            }
          } catch (error) {
            // 静默失败，不影响用户体验
            console.error('记录文章阅读失败:', error)
          }
        }
        
        recordView()
      }
    }
    
    // 组件卸载时清理（如果需要）
    return () => {}
  }, [postId])
  
  // 这是一个无UI组件，不渲染任何内容
  return null
} 