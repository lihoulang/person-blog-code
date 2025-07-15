'use client';

import { useAuth } from '@/context/AuthContext';
import ProfileForm from '@/components/ProfileForm';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-xl font-medium mb-6">个人资料</h2>
      <p className="text-gray-500 text-sm mb-8">更新您的个人信息和账户设置</p>
      
      <ProfileForm />
    </div>
  );
} 