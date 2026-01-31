// src/components/Button.jsx

import React from 'react';

const Button = ({ children, onClick, disabled, className = '', type = 'button' }) => {
    // 基础的品牌橙色 CTA 样式
    const baseClasses = `
        w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white 
        bg-[#FF8C00] hover:bg-[#cc7000] transition duration-150 ease-in-out
    `;
    
    // 禁用状态
    const disabledClasses = disabled ? 'bg-orange-300 cursor-not-allowed' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${disabledClasses} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;