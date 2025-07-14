// 用户接口
export interface User {
  id: string
  username: string
  email: string
  password?: string // 仅在创建时使用，不应该返回给前端
  name: string
  role: 'admin' | 'author'
  createdAt?: Date
  updatedAt?: Date
}

// 登录凭据
export interface Credentials {
  email: string
  password: string
}

// 认证响应
export interface AuthResponse {
  user: Omit<User, 'password'> // 不包含密码的用户信息
  token: string
}

// JWT荷载内容
export interface JWTPayload {
  id: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// 认证上下文类型
export interface AuthContextType {
  user: Omit<User, 'password'> | null
  login: (_credentials: Credentials) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
} 