'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'author'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      // 用户未登录，重定向到登录页面
      router.push('/auth/login')
    } else if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      // 用户权限不足，重定向到首页
      router.push('/')
    }
  }, [user, isLoading, router, requiredRole])

  // 加载中状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 未登录或权限不足时不渲染子组件
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null
  }

  // 已登录且有足够权限时渲染子组件
  return <>{children}</>
} 