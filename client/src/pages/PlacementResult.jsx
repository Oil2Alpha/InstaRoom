// src/pages/PlacementResult.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

const PlacementResult = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(['placement', 'common']);
    const [placementData, setPlacementData] = useState(null);
    const [userPhoto, setUserPhoto] = useState(null);
    const [selectedOption, setSelectedOption] = useState(0);
    const [expandedFurniture, setExpandedFurniture] = useState(null);

    useEffect(() => {
        const storedData = localStorage.getItem('placementResult');
        const storedPhoto = localStorage.getItem('placementPhoto');

        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                setPlacementData(data);
                console.log('Placement data:', data);
            } catch (error) {
                console.error('Parse data failed:', error);
            }
        } else {
            console.warn('No placement data found');
        }

        if (storedPhoto) {
            setUserPhoto(storedPhoto);
        }
    }, []);

    if (!placementData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">{t('results.noData')}</p>
                    <button
                        onClick={() => navigate('/placement/input')}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        {t('results.backToInput')}
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
                    <span>{t('results.actions.backToHome')}</span>
                </button>

                {/* 标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        {t('results.title')}
                    </h1>
                    <p className="text-gray-600">{t('results.subtitle', { count: placementData.options.length })}</p>
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
                            {t('results.option')} {option.id}
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
                            <h3 className="text-xl font-semibold mb-4">{t('results.aiRendered')}</h3>
                            <img
                                src={`data:image/png;base64,${currentOption.renderedImage}`}
                                alt="Rendered"
                                className="w-full rounded-lg"
                            />
                        </div>
                    )}

                    {/* 原始照片对比 */}
                    {userPhoto && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">{t('results.originalPhoto')}</h3>
                            <img
                                src={userPhoto}
                                alt="Original"
                                className="w-full rounded-lg"
                            />
                        </div>
                    )}

                    {/* 家具清单 */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">{t('results.furnitureList.title')}</h3>
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
                                                <p className="text-sm font-medium text-gray-700 mb-2">{t('results.furnitureList.styleKeywords')}</p>
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
                                                    <p className="text-sm font-medium text-gray-700 mb-2">{t('results.furnitureList.materials')}</p>
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
                                                <p className="text-sm font-medium text-gray-700 mb-1">{t('results.furnitureList.position')}</p>
                                                <p className="text-sm text-gray-600">{furniture.position}</p>
                                            </div>

                                            {/* 推荐商品 */}
                                            {furniture.recommendedProducts && furniture.recommendedProducts.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                                        {t('results.furnitureList.products')}（{furniture.recommendedProducts.length}）
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
                                                                        {t('results.furnitureList.matchScore')} {Math.round(product.matchScore * 100)}%
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
                            <h3 className="text-xl font-semibold mb-4">{t('results.environment.title')}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">{t('results.environment.style')}</p>
                                    <p className="font-medium">{placementData.environment.inherent_style}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{t('results.environment.colorMaterial')}</p>
                                    <p className="font-medium">{placementData.environment.dominant_color_material}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{t('results.environment.lightDirection')}</p>
                                    <p className="font-medium">{placementData.environment.light_source_direction}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{t('results.environment.shadowIntensity')}</p>
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
                            {t('results.actions.redesign')}
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                            {t('results.actions.backToHome')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlacementResult;