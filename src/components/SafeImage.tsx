// src/components/SafeImage.tsx
// 处理SSL证书错误的图片组件

import React, { useState, useRef } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export default function SafeImage({
  src,
  alt,
  style,
  className,
  loading = 'lazy',
  decoding = 'async',
  fallbackSrc,
  onError,
  onLoad,
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleError = () => {
    console.log(`Image failed to load: ${src}`);
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // 如果图片加载失败且没有备用图片，显示占位符
  if (imageError && !fallbackSrc) {
    return (
      <div
        style={{
          ...style,
          backgroundColor: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '12px',
        }}
        className={className}
      >
        No Image
      </div>
    );
  }

  // 如果图片加载失败但有备用图片，使用备用图片
  if (imageError && fallbackSrc) {
    return (
      <img
        ref={imgRef}
        src={fallbackSrc}
        alt={alt}
        style={style}
        className={className}
        loading={loading}
        decoding={decoding}
        onError={() => {
          console.log(`Fallback image also failed: ${fallbackSrc}`);
          setImageError(true);
        }}
        onLoad={handleLoad}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      style={style}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={handleError}
      onLoad={handleLoad}
      // 添加这些属性来尝试绕过SSL证书问题
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
  );
}
