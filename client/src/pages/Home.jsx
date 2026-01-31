// src/pages/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import scoringIcon from '../assets/images/scoring_icon.png';
import furnitureSwapIcon from '../assets/images/furniture_swap_icon.png';
import wholeHomeIcon from '../assets/images/whole_home_icon.png';

const Home = () => {
    const navigate = useNavigate();

    const features = [
        {
            id: 1,
            title: '房间评分',
            subtitle: 'AI 智能评估',
            description: '专业设计师视角，从功能、美学、照明等维度深度分析您的空间',
            icon: scoringIcon,
            route: '/score/input',
            color: 'from-orange-400 to-orange-600',
            available: true
        },
        {
            id: 2,
            title: '家具置换',
            subtitle: '智能推荐方案',
            description: '精准尺寸计算，风格匹配，为您推荐最适合的家具替换方案',
            icon: furnitureSwapIcon,
            route: '/placement/input',
            color: 'from-amber-400 to-orange-500',
            available: true // 已完成开发
        },
        {
            id: 3,
            title: '全屋定制',
            subtitle: '风格定制方案',
            description: '上传硬装照片，AI 为您定制专属软装方案，从设计到购物清单一站搞定',
            icon: wholeHomeIcon,
            route: '/room-customization/input',
            color: 'from-yellow-400 to-amber-500',
            available: true // 已完成开发
        }
    ];

    const handleFeatureClick = (feature) => {
        if (feature.available) {
            navigate(feature.route);
        } else {
            alert('该功能正在开发中，敬请期待！');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300 rounded-full blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 px-4 pt-8 pb-12">
                    <Logo />

                    {/* Hero Text */}
                    <div className="max-w-2xl mx-auto text-center mt-12 mb-16">
                        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            让家，更懂你
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto">
                            AI 驱动的智能家居设计平台
                            <br />
                            <span className="text-[#FF8C00] font-medium">从评估到定制，一站式打造理想空间</span>
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                onClick={() => handleFeatureClick(feature)}
                                className={`
                                    group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl 
                                    transition-all duration-500 ease-out cursor-pointer overflow-hidden
                                    ${feature.available ? 'hover:scale-105' : 'opacity-75'}
                                `}
                                style={{
                                    animationDelay: `${index * 150}ms`,
                                    animation: 'fadeInUp 0.8s ease-out forwards'
                                }}
                            >
                                {/* Gradient Overlay on Hover */}
                                <div className={`
                                    absolute inset-0 bg-gradient-to-br ${feature.color} 
                                    opacity-0 group-hover:opacity-10 transition-opacity duration-500
                                `}></div>

                                {/* Coming Soon Badge */}
                                {!feature.available && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-gray-400 rounded-full">
                                            开发中
                                        </span>
                                    </div>
                                )}

                                {/* Card Content */}
                                <div className="relative z-10 p-8">
                                    {/* Icon */}
                                    <div className="mb-6 flex justify-center">
                                        <div className="w-32 h-32 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                                            <img
                                                src={feature.icon}
                                                alt={feature.title}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="text-center">
                                        <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm font-medium text-[#FF8C00] mb-4">
                                            {feature.subtitle}
                                        </p>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                    {/* CTA Arrow */}
                                    {feature.available && (
                                        <div className="mt-6 flex justify-center">
                                            <div className="flex items-center text-[#FF8C00] font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                                                开始体验
                                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="max-w-3xl mx-auto text-center mt-20 mb-8 px-4">
                        <div className="inline-block px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">20-45 岁</span> 追求生活美学的您
                                <span className="mx-2">•</span>
                                <span className="text-[#FF8C00] font-medium">专业 AI 设计助手</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inline Animation Styles */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
