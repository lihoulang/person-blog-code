'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthContextType, User } from '@/types/auth'
import { useRouter } from 'next/navigation'

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 认证提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [_error, _setError] = useState<string | null>(null)
  const router = useRouter()

  // 初始化 - 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 调用验证API，由于使用了credentials: 'include'，会自动发送cookie
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (err) {
        console.error('认证检查失败:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // 登录方法
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '登录失败');
      }

      const data = await response.json();
      setUser(data.user);

    // 登录成功时的事件处理
    const event = new CustomEvent('auth:login', { 
        detail: { user: data.user } 
      });
      window.dispatchEvent(event);

      return data.user;
    } catch (error: any) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  // 注册方法
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '注册失败');
      }

      const data = await response.json();
      setUser(data.user);

      // 注册成功时的事件处理
      const event = new CustomEvent('auth:register', { 
        detail: { user: data.user } 
    });
    window.dispatchEvent(event);

      return data.user;
    } catch (error: any) {
      console.error('注册失败:', error);
      throw error;
    }
  }

  // 登出方法
  const logout = async () => {
    try {
      // 调用服务器登出API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      // 清除用户状态
      setUser(null)
      
      // 触发登出事件
      const event = new CustomEvent('auth:logout');
      window.dispatchEvent(event);
      
      // 重定向到登录页面
      router.push('/auth/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isLoading,
        error: _error
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// 使用认证上下文的钩子
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内使用')
  }
  return context
} 