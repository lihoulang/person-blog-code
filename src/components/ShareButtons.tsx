'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  showText?: boolean;
}

export default function ShareButtons({ 
  title, 
  url, 
  description = '', 
  showText = false 
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  // 复制链接到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('链接已复制到剪贴板');
      
      // 3秒后重置复制状态
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('复制失败，请手动复制链接');
      console.error('复制失败:', err);
    }
  };

  // 显示微信二维码
  const toggleQrCode = () => {
    setQrVisible(!qrVisible);
  };

  const shareButtons = [
    {
      name: '微信',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.667 7.556c-.556 0-1 .444-1 1s.444 1 1 1 1-.444 1-1-.444-1-1-1zm6.667 0c-.556 0-1 .444-1 1s.444 1 1 1 1-.444 1-1-.444-1-1-1zm-10 4.444c0-3.333 3.556-6 7.889-6 4.333 0 7.778 2.667 7.778 6 0 3.333-3.445 6-7.778 6-.889 0-1.778-.111-2.556-.333-.333-.111-.667 0-.889.111l-1.778.889c-.222.111-.444 0-.556-.222-.111-.111-.111-.222-.111-.333v-1.667c0-.222-.111-.444-.333-.556-1.889-1.222-3.111-3-3.111-5.111 0-.222.222-.444.444-.444s.444.222.444.444c0 1.778 1.111 3.333 2.778 4.333.333.222.556.667.556 1.111v.778l.778-.333c.444-.222.889-.333 1.333-.222.667.111 1.333.222 2.111.222 3.778 0 6.889-2.222 6.889-5s-3.111-5-6.889-5c-3.778 0-6.889 2.222-6.889 5 0 .222-.222.444-.444.444s-.444-.222-.444-.444z" />
        </svg>
      ),
      onClick: toggleQrCode
    },
    {
      name: '微博',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.01 3C17.49 3 15.36 5.02 15.36 7.52c0 .25.02.5.06.73a.5.5 0 01-.41.57 1.56 1.56 0 00-.34.08C11.22 9.85 6 13.62 6 17.5c0 3.45 4.65 5.5 8.66 5.5 6.25 0 10.34-4.17 10.34-8 0-2.2-1.28-4.17-3.87-5.42a.41.41 0 01-.24-.36c0-.87.7-1.74.77-2.64.02-.39.07-2.07-1.86-3.13-.28-.15-.54-.21-.79-.45zm-9.33 9.3c2.1-.06 4.09.43 4.09 1.5 0 1.07-2.16 2.13-4.74 2.13-2.13 0-3.86-.85-3.86-1.92 0-1.07 2.62-1.65 4.5-1.71zm1.25 2.17c.15 0 .27-.12.27-.27a.27.27 0 00-.27-.27.27.27 0 00-.27.27c0 .15.12.27.27.27zm-1.46.8a1.38 1.38 0 100-2.76 1.38 1.38 0 000 2.76zm5.75-10.55c.57.44 1.28.66 2.04.62 1.65-.09 2.64-1.25 2.2-2.57-.44-1.33-2.2-2.3-3.94-2.17-1.74.13-2.87 1.5-2.4 3.05.16.56.53 1.07 1.1 1.07z" />
        </svg>
      ),
      href: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`
    },
    {
      name: 'Twitter',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.952 7.983c.012.174.012.347.012.523C19.964 13.845 15.837 20 8.29 20v-.003A11.75 11.75 0 0 1 3 18.186a8.322 8.322 0 0 0 6.073-1.674c-1.756-.033-3.296-1.16-3.834-2.806a4.152 4.152 0 0 0 1.853-.07C5.188 13.256 3.733 11.585 3.733 9.54v-.05a4.15 4.15 0 0 0 1.859.505C3.988 9.017 3.26 6.988 4.15 5.29c1.96 2.39 4.88 3.837 8.02 3.986a4.15 4.15 0 0 1 7.06-3.778c.998-.197 1.953-.56 2.815-1.071a4.15 4.15 0 0 1-1.827 2.288A8.262 8.262 0 0 0 22 6.202a8.4 8.4 0 0 1-2.048 2.098v-.002z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    },
    {
      name: 'Facebook',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`
    },
    {
      name: '复制链接',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2v0z" />
          <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" />
        </svg>
      ),
      onClick: copyToClipboard
    }
  ];

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-3">
        {shareButtons.map((button, index) => (
          <div key={index} className="relative group">
            {button.href ? (
              <a
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                aria-label={`分享到${button.name}`}
              >
                {button.icon}
              </a>
            ) : (
              <button
                onClick={button.onClick}
                className={`flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors ${
                  button.name === '复制链接' && copied ? 'bg-green-100 text-green-700' : ''
                }`}
                aria-label={button.name}
              >
                {button.icon}
              </button>
            )}
            {showText && (
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {button.name}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {/* 微信二维码弹窗 */}
      {qrVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={toggleQrCode}>
          <div className="bg-white p-6 rounded-lg max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-center">微信扫一扫分享</h3>
            <div className="flex justify-center mb-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`}
                alt="微信分享二维码" 
                width={200} 
                height={200} 
                className="border"
              />
            </div>
            <p className="text-sm text-gray-500 text-center mb-4">
              打开微信，点击底部的"发现"，使用"扫一扫"即可将网页分享给朋友。
            </p>
            <div className="flex justify-center">
              <button 
                onClick={toggleQrCode}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 