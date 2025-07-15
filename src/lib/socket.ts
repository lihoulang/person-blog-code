import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

// 保存Socket.IO实例
let io: SocketIOServer | null = null;

// 保存在线用户
const onlineUsers = new Map<string, string>();

// 初始化Socket.IO服务器
export function initSocketServer(server: NetServer) {
  if (io) return io;
  
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // 身份验证中间件
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('未授权'));
      }
      
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error('服务器配置错误'));
      }
      
      const decoded = verify(token, secret) as any;
      socket.data.userId = decoded.id;
      
      next();
    } catch (error) {
      next(new Error('身份验证失败'));
    }
  });
  
  // 连接事件
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    
    // 保存用户连接
    onlineUsers.set(userId, socket.id);
    console.log(`用户 ${userId} 连接成功，当前在线用户: ${onlineUsers.size}`);
    
    // 加入个人房间
    socket.join(`user:${userId}`);
    
    // 断开连接
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`用户 ${userId} 断开连接，当前在线用户: ${onlineUsers.size}`);
    });
  });
  
  return io;
}

// 获取Socket.IO实例
export function getSocketServer() {
  return io;
}

// 发送私人消息
export function sendPrivateMessage(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

// 发送全局消息
export function sendGlobalMessage(event: string, data: any) {
  if (!io) return;
  io.emit(event, data);
}

// Socket.IO API路由处理程序
export function socketHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!io) {
    res.status(500).json({ error: 'Socket.IO服务器未初始化' });
    return;
  }
  
  res.status(200).json({ online: onlineUsers.size });
} 