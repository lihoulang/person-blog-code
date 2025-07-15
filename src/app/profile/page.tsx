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
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // 如果用户未登录且加载完成，重定向到登录页
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
    
    // 如果用户已登录，获取用户的文章
    if (user) {
      setLoading(false);
    }
  }, [user, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">个人中心</h1>
      
      {/* 导航标签 */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'profile' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          我的资料
        </button>
        <Link 
          href="/profile/posts" 
          className="px-4 py-2 font-medium text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          我的文章
        </Link>
        <Link 
          href="/profile/bookmarks" 
          className="px-4 py-2 font-medium text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          我的收藏
        </Link>
        <Link 
          href="/profile/comments" 
          className="px-4 py-2 font-medium text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          我的评论
        </Link>
      </div>
      
      {/* 个人资料卡片 */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">个人资料</h2>
          <p className="text-gray-500 text-sm mt-1">更新您的个人信息和账户设置</p>
        </div>
        
        <div className="p-6">
          <ProfileForm />
        </div>
      </div>
      
      {/* 账户安全卡片 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">账户安全</h2>
          <p className="text-gray-500 text-sm mt-1">管理您的账户安全设置</p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">账户登录</h3>
              <p className="text-sm text-gray-500">上次登录时间: {new Date().toLocaleString('zh-CN')}</p>
            </div>
            <button 
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              查看登录历史
            </button>
          </div>
        </div>
      </div>
    </div>
  );
            <button 
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              查看登录历史
            </button>
          </div>
        </div>
      </div>
    </div>
  );