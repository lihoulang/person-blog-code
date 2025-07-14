import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '订阅确认成功 - 个人博客',
  description: '您已成功订阅我们的博客更新',
};

export default function SubscriptionConfirmed() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 p-6 rounded-lg mb-8">
          <svg 
            className="w-16 h-16 mx-auto mb-4 text-green-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h1 className="text-2xl font-bold mb-2">订阅确认成功!</h1>
          <p>感谢您订阅我们的博客更新。您将会收到最新的文章和动态通知。</p>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            我们会将最新、最有价值的内容发送到您的邮箱。
            您可以随时取消订阅，每封邮件底部都有取消订阅链接。
          </p>
          
          <div className="mt-8">
            <Link 
              href="/" 
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 