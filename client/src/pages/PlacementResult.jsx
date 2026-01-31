// src/pages/PlacementResult.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const PlacementResult = () => {
    const navigate = useNavigate();
    const [placementData, setPlacementData] = useState(null);
    const [userPhoto, setUserPhoto] = useState(null);
    const [selectedOption, setSelectedOption] = useState(0); // 当前选中的方案（0 或 1）
    const [expandedFurniture, setExpandedFurniture] = useState(null); // 展开的家具索引

    useEffect(() => {
        // 从 localStorage 读取数据
        const storedData = localStorage.getItem('placementResult');
        const storedPhoto = localStorage.getItem('placementPhoto');

        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                setPlacementData(data);
                console.log('置换数据:', data);
            } catch (error) {
                console.error('解析数据失败:', error);
            }
        } else {
            console.warn('未找到置换数据');
        }

        if (storedPhoto) {
            setUserPhoto(storedPhoto);
        }
    }, []);

    if (!placementData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">未找到置换数据</p>
                    <button
                        onClick={() => navigate('/placement/input')}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        返回输入页面
                    </button>
                </div>
            </div>
        );
    }

    const currentOption = placementData.options[selectedOption];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            {/* 内容容器 */}
            <div className="relative max-w-6xl mx-auto p-6">
                <Logo />

                {/* 返回按钮 */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
                >
                    <span>←</span>
                    <span>返回主页</span>
                </button>

                {/* 标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        AI 置换方案
                    </h1>
                    <p className="text-gray-600">为您生成了 {placementData.options.length} 套专业设计方案</p>
                </div>

                {/* 方案切换 Tab */}
                <div className="flex justify-center gap-4 mb-8">
                    {placementData.options.map((option, index) => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedOption(index)}
                            className={`px-8 py-3 rounded-full font-semibold transition-all ${selectedOption === index
                                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                                }`}
                        >
                            方案 {option.id}
                        </button>
                    ))}
                </div>

                {/* 当前方案详情 */}
                <div className="space-y-6">
                    {/* 方案信息卡片 */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentOption.name}</h2>
                        <p className="text-gray-600">{currentOption.description}</p>
                    </div>

                    {/* 效果图展示 */}
                    {currentOption.renderedImage && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">AI 生成效果图</h3>
                            <img
                                src={`data:image/png;base64,${currentOption.renderedImage}`}
                                alt="置换效果图"
                                className="w-full rounded-lg"
                            />
                        </div>
                    )}

                    {/* 原始照片对比 */}
                    {userPhoto && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">原始照片</h3>
                            <img
                                src={userPhoto}
                                alt="原始照片"
                                className="w-full rounded-lg"
                            />
                        </div>
                    )}

                    {/* 家具清单 */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">家具清单</h3>
                        <div className="space-y-4">
                            {currentOption.furnitureList.map((furniture, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* 家具头部 */}
                                    <div
                                        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => setExpandedFurniture(expandedFurniture === index ? null : index)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">📦</span>
                                                <div>
                                                    <h4 className="font-semibold text-lg">{furniture.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {furniture.estimatedDimensions.length}×
                                                        {furniture.estimatedDimensions.width}×
                                                        {furniture.estimatedDimensions.height} cm
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-gray-400">
                                                {expandedFurniture === index ? '▼' : '▶'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 家具详情（可展开） */}
                                    {expandedFurniture === index && (
                                        <div className="p-4 space-y-4">
                                            {/* 风格和材质标签 */}
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">风格关键词</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {furniture.styleKeywords.map((keyword, i) => (
                                                        <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {furniture.materialTags && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">材质标签</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {furniture.materialTags.map((tag, i) => (
                                                            <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-1">位置</p>
                                                <p className="text-sm text-gray-600">{furniture.position}</p>
                                            </div>

                                            {/* 推荐商品 */}
                                            {furniture.recommendedProducts && furniture.recommendedProducts.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                                        推荐商品（{furniture.recommendedProducts.length}个）
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {furniture.recommendedProducts.map((product) => (
                                                            <div key={product.furniture_id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                                                <img
                                                                    src={product.image_url}
                                                                    alt={product.name}
                                                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                                                />
                                                                <h5 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h5>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-orange-600 font-bold">¥{product.price}</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        匹配度 {Math.round(product.matchScore * 100)}%
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {product.dimensions.length_cm.toFixed(0)}×
                                                                    {product.dimensions.width_cm.toFixed(0)}×
                                                                    {product.dimensions.height_cm.toFixed(0)} cm
                                                                </p>
                                                                {product.brand && (
                                                                    <p className="text-xs text-gray-400 mt-1">{product.brand}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 环境分析信息 */}
                    {placementData.environment && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">房间环境分析</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">房间风格</p>
                                    <p className="font-medium">{placementData.environment.inherent_style}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">主色调材质</p>
                                    <p className="font-medium">{placementData.environment.dominant_color_material}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">光照方向</p>
                                    <p className="font-medium">{placementData.environment.light_source_direction}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">阴影强度</p>
                                    <p className="font-medium">{placementData.environment.shadow_intensity}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 底部操作按钮 */}
                    <div className="flex justify-center gap-4 pt-6">
                        <button
                            onClick={() => navigate('/placement/input')}
                            className="px-8 py-3 bg-white text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                            重新设计
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                            返回主页
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlacementResult;