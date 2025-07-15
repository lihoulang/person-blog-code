'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

export default function ProfileForm() {
  const { user, updateProfile } = useAuth();
  
  // 表单状态
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 加载状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('新密码与确认密码不匹配');
      return;
    }
    
    if (newPassword && !currentPassword) {
      toast.error('请输入当前密码');
      return;
    }
    
    // 检查是否有更改
    const hasNameChange = name !== user?.name;
    const hasEmailChange = email !== user?.email;
    const hasPasswordChange = newPassword.length > 0;
    
    if (!hasNameChange && !hasEmailChange && !hasPasswordChange) {
      toast.info('未检测到资料变更');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 准备更新数据
      const updateData: {
        name?: string;
        email?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {};
      
      if (hasNameChange) updateData.name = name;
      if (hasEmailChange) updateData.email = email;
      if (hasPasswordChange) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }
      
      // 调用更新方法
      await updateProfile(updateData);
      
      // 成功提示
      toast.success('资料更新成功');
      
      // 清除密码字段
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || '更新失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="请输入您的姓名"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="请输入您的邮箱地址"
            />
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">修改密码</h3>
          <p className="text-sm text-gray-500 mb-4">如需修改密码，请填写以下字段</p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                当前密码
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="请输入当前密码"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                新密码
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="请输入新密码"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认新密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="请再次输入新密码"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '保存中...' : '保存更改'}
          </button>
        </div>
      </div>
    </form>
  );
} 