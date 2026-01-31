// src/components/Logo.jsx
import React from 'react';
import logoIcon from '../assets/images/logo_icon.svg';  // 导入 SVG 文件

const Logo = () => {
  return (
    <div className="flex items-center justify-center space-x-2 my-8">
      {/* 使用导入的 SVG 图片 */}
      <img 
        src={logoIcon} 
        alt="InstaRoom Logo" 
        className="h-10 w-auto"  // 根据需要调整高度，宽度自动适应
      />
      <span className="text-3xl font-semibold text-gray-900">
        InstaRoom
      </span>
    </div>
  );
};

export default Logo;