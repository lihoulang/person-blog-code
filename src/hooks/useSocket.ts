import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

let socket: Socket | null = null;

export function useSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 只有在用户登录时才初始化Socket
    if (!user) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      setIsConnected(false);
      return;
    }

    // 如果已经有Socket连接，不再创建新的
    if (socket && socket.connected) {
      setIsConnected(true);
      return;
    }

    // 获取存储的token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('未找到认证令牌');
      return;
    }

    // 创建Socket连接
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    // 连接事件
    socket.on('connect', () => {
      console.log('Socket连接成功');
      setIsConnected(true);
      setError(null);
    });

    // 连接错误
    socket.on('connect_error', (err) => {
      console.error('Socket连接失败:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // 断开连接
    socket.on('disconnect', (reason) => {
      console.log('Socket断开连接:', reason);
      setIsConnected(false);
    });

    // 清理函数
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('connect_error');
        socket.off('disconnect');
      }
    };
  }, [user]);

  // 发送消息
  const emit = (event: string, data: any, callback?: (response: any) => void) => {
    if (!socket || !isConnected) {
      console.error('Socket未连接，无法发送消息');
      return;
    }
    
    if (callback) {
      socket.emit(event, data, callback);
    } else {
      socket.emit(event, data);
    }
  };

  // 监听事件
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (!socket) {
      console.error('Socket未初始化，无法监听事件');
      return () => {};
    }
    
    socket.on(event, callback);
    return () => socket?.off(event, callback);
  };

  // 移除监听
  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (!socket) return;
    
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  };

  return {
    socket,
    isConnected,
    error,
    emit,
    on,
    off,
  };
} 