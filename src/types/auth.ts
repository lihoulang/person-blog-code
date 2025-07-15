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

// 用户资料更新数据
export interface ProfileUpdateData {
  name?: string
  email?: string
  currentPassword?: string
  newPassword?: string
}

// 认证上下文类型
export interface AuthContextType {
  user: Omit<User, 'password'> | null
  login: (_email: string, _password: string) => Promise<any>
  register: (_name: string, _email: string, _password: string) => Promise<any>
  logout: () => void
  updateProfile: (_data: ProfileUpdateData) => Promise<any>
  isLoading: boolean
  error: string | null
} 