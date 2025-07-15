import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  fallbackText?: string;
}

export default function Avatar({ src, alt, size = 'md', fallbackText }: AvatarProps) {
  // 根据size确定尺寸
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64
  };
  
  const pixelSize = sizes[size];
  const initialLetter = fallbackText ? fallbackText.charAt(0).toUpperCase() : alt.charAt(0).toUpperCase();
  
  // 如果没有提供图片源，则显示首字母头像
  if (!src) {
    return (
      <div 
        className={`bg-blue-500 text-white rounded-full flex items-center justify-center`}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <span className={`font-medium ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          {initialLetter}
        </span>
      </div>
    );
  }
  
  // 使用Next.js的Image组件显示头像
  return (
    <div className={`overflow-hidden rounded-full`} style={{ width: pixelSize, height: pixelSize }}>
      <Image 
        src={src} 
        alt={alt}
        width={pixelSize}
        height={pixelSize}
        className="object-cover"
        priority={size === 'lg'} // 大头像优先加载
      />
    </div>
  );
} 