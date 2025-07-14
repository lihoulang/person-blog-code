import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, JWTPayload } from '../types/auth'
import { prisma } from './prisma'
import { cookies } from 'next/headers'

// JWT配置
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET
  if (!secret) {
    console.error('未配置JWT密钥，请设置JWT_SECRET或AUTH_SECRET环境变量')
    // 在生产环境应该抛出错误，但这里返回空字符串以防止运行时错误
    return ''
  }
  return secret
}

const JWT_EXPIRES_IN = '7d'

// 验证用户凭据
export async function verifyCredentials(userEmail: string, password: string): Promise<User | null> {
  try {
    // 从数据库查找用户
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

  if (!user) return null

  // 验证密码
    const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  // 返回用户信息（不包含密码）
    return {
      id: user.id.toString(),
      username: user.email.split('@')[0], // 从邮箱生成用户名
      email: user.email,
      name: user.name || user.email.split('@')[0], // 如果没有名字，使用邮箱前缀
      role: 'admin', // 根据实际情况设置角色
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  } catch (error) {
    console.error('验证用户凭据失败:', error)
    return null
  }
}

// 生成JWT令牌
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN })
}

// 验证JWT令牌
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload
  } catch (error) {
    console.error('令牌验证失败:', error)
    return null
  }
}

// 获取当前用户（从令牌中）
export async function getCurrentUser(token: string | null): Promise<User | null> {
  if (!token) return null
  
  const payload = verifyToken(token)
  if (!payload) return null

  try {
    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: payload.email }
    })

  if (!user) return null

  // 返回用户信息（不包含密码）
    return {
      id: user.id.toString(),
      username: user.email.split('@')[0],
      email: user.email,
      name: user.name || user.email.split('@')[0],
      role: 'admin', // 根据实际情况设置
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  } catch (error) {
    console.error('获取当前用户失败:', error)
    return null
  }
}

// 从请求中获取用户信息
export async function getUserFromRequest(request: Request): Promise<User | null> {
  // 尝试从请求头中获取授权令牌
  const authHeader = request.headers.get('authorization')
  let token = null
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else {
    // 如果请求头中没有，尝试从cookie中获取
    const cookieStore = cookies()
    token = cookieStore.get('token')?.value || null
  }
  
  if (!token) return null
  return await getCurrentUser(token)
}

// 哈希密码 (用于创建新用户)
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
} 