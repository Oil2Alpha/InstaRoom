// src/pages/RoomCustomizationResult.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const RoomCustomizationResult = () => {
    const [data, setData] = useState(null);
    const [originalPhoto, setOriginalPhoto] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 从 sessionStorage 读取数据
        const resultData = sessionStorage.getItem('roomCustomizationResult');
        const photoData = sessionStorage.getItem('roomCustomizationOriginalPhoto');

        if (!resultData || !photoData) {
            alert('数据丢失，请重新生成');
            navigate('/room-customization/input');
            return;
        }

        try {
            const parsedData = JSON.parse(resultData);
            setData(parsedData);
            setOriginalPhoto(photoData);
        } catch (error) {
            console.error('数据解析错误:', error);
            alert('数据解析失败');
            navigate('/room-customization/input');
        }
    }, [navigate]);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50/30 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-blue-50 p-4 pb-12">
            <div className="max-w-6xl mx-auto">
                {/* 返回按钮 */}
                <button
                    onClick={() => navigate('/room-customization/input')}
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200 mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回定制页面
                </button>

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>

                {/* 标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                            ✨ 您的专属定制方案
                        </span>
                    </h1>
                    <p className="text-gray-600 text-lg">{data.design_plan.title}</p>
                </div>

                {/* 设计方案 */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">🎨 设计方案</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">{data.design_plan.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.design_plan.key_features.map((feature, index) => (
                            <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-100">
                                <p className="text-indigo-700 font-medium">✓ {feature}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 效果图对比 */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">改造前后对比</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 原始照片 */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-700 text-center">改造前</h3>
                            <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-gray-200">
                                <img
                                    src={originalPhoto}
                                    alt="原始房间"
                                    className="w-full h-auto"
                                />
                                <div className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                                    原始照片
                                </div>
                            </div>
                        </div>

                        {/* 渲染效果图 */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-700 text-center">改造后</h3>
                            <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-indigo-200">
                                {data.rendered_image ? (
                                    <img
                                        src={`data:image/jpeg;base64,${data.rendered_image}`}
                                        alt="定制效果"
                                        className="w-full h-auto"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                                        <p className="text-gray-500">渲染图生成失败</p>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-lg text-sm">
                                    ✨ AI 定制
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 购物清单 */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            🛍️ 购物清单
                        </h2>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">预算总计</p>
                            <p className="text-2xl font-bold text-indigo-600">¥{data.total_cost}</p>
                        </div>
                    </div>

                    {data.shopping_list && data.shopping_list.length > 0 ? (
                        <div className="space-y-4">
                            {data.shopping_list.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-200 hover:shadow-lg"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="inline-block bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                                                    {item.category}
                                                </span>
                                                {item.is_second_hand && (
                                                    <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                        ♻️ 二手
                                                    </span>
                                                )}
                                                <span className={`inline-block text-xs px-2 py-1 rounded-full ${item.priority === '必需' ? 'bg-red-100 text-red-600' :
                                                        item.priority === '推荐' ? 'bg-yellow-100 text-yellow-600' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {item.priority}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {item.tags && item.tags.map((tag, tagIndex) => (
                                                    <span
                                                        key={tagIndex}
                                                        className="bg-white text-indigo-600 text-xs px-2 py-1 rounded-lg border border-indigo-200"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                💡 {item.reason}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-2xl font-bold text-indigo-600">¥{item.price}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">暂无购物清单</p>
                    )}
                </div>

                {/* 房间分析（可选展示） */}
                {data.room_analysis && (
                    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 房间分析</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-indigo-50 rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">面积</p>
                                <p className="text-lg font-bold text-indigo-600">{data.room_analysis.area_range}㎡</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">层高</p>
                                <p className="text-lg font-bold text-purple-600">{data.room_analysis.ceiling_height}m</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">采光</p>
                                <p className="text-lg font-bold text-blue-600">{data.room_analysis.natural_light}</p>
                            </div>
                            <div className="text-center p-4 bg-indigo-50 rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">空间感</p>
                                <p className="text-lg font-bold text-indigo-600">{data.room_analysis.space_feeling}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 操作按钮 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/room-customization/input')}
                        className="w-full py-4 px-6 rounded-xl shadow-lg text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-500 transition-all duration-200"
                    >
                        ← 重新定制
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 px-6 rounded-xl shadow-lg text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
                    >
                        返回主页 🏠
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomCustomizationResult;
