// src/pages/DreamHomeResult.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

const DreamHomeResult = () => {
    const [data, setData] = useState(null);
    const [originalPhoto, setOriginalPhoto] = useState(null);
    const navigate = useNavigate();
    const { t } = useTranslation(['dreamHome', 'common']);

    useEffect(() => {
        // 从 sessionStorage 读取数据
        const resultData = sessionStorage.getItem('dreamHomeResult');
        const photoData = sessionStorage.getItem('dreamHomeOriginalPhoto');

        if (!resultData || !photoData) {
            alert(t('results.dataLost'));
            navigate('/score/result');
            return;
        }

        try {
            const parsedData = JSON.parse(resultData);
            setData(parsedData);
            setOriginalPhoto(photoData);
        } catch (error) {
            console.error('Data parsing error:', error);
            alert(t('results.parseError'));
            navigate('/score/result');
        }
    }, [navigate, t]);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('common:loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20 p-4 pb-12">
            <div className="max-w-6xl mx-auto">
                {/* 返回按钮 */}
                <button
                    onClick={() => navigate('/score/result')}
                    className="flex items-center text-gray-600 hover:text-purple-500 transition-colors duration-200 mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t('backToScore')}
                </button>

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Logo />
                </div>

                {/* 标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                            ✨ {t('results.title')}
                        </span>
                    </h1>
                    <p className="text-gray-600 text-lg">{t('subtitle')}</p>
                </div>

                {/* 对比展示 */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('results.comparison.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 原始照片 */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-700 text-center">{t('results.comparison.before')}</h3>
                            <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-gray-200">
                                <img
                                    src={originalPhoto}
                                    alt="Original"
                                    className="w-full h-auto"
                                />
                                <div className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                                    {t('results.comparison.originalPhoto')}
                                </div>
                            </div>
                        </div>

                        {/* 渲染效果图 */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-700 text-center">{t('results.comparison.after')}</h3>
                            <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-purple-200">
                                {data.renderedImage ? (
                                    <img
                                        src={`data:image/jpeg;base64,${data.renderedImage}`}
                                        alt="Dream Home"
                                        className="w-full h-auto"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                                        <p className="text-gray-500">{t('results.comparison.renderFailed')}</p>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg text-sm">
                                    ✨ {t('results.comparison.aiRendered')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 购物清单 */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                            {t('results.shoppingList.title')}
                        </span>
                    </h2>

                    {data.shoppingList && data.shoppingList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.shoppingList.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-100 hover:border-purple-300 transition-all duration-200 hover:shadow-lg"
                                >
                                    {/* 商品类别和名称 */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                                                {item.category}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                                        </div>
                                        <span className="text-purple-600 font-bold text-lg">
                                            ¥{item.estimatedPrice}
                                        </span>
                                    </div>

                                    {/* 标签 */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {item.tags.map((tag, tagIndex) => (
                                            <span
                                                key={tagIndex}
                                                className="bg-white text-purple-600 text-xs px-2 py-1 rounded-lg border border-purple-200"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* 推荐理由 */}
                                    <p className="text-gray-600 text-sm">
                                        💡 {item.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">{t('results.shoppingList.empty')}</p>
                    )}
                </div>

                {/* 操作按钮 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/score/result')}
                        className="w-full py-4 px-6 rounded-xl shadow-lg text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-500 transition-all duration-200"
                    >
                        {t('results.actions.backToScore')}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 px-6 rounded-xl shadow-lg text-lg font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                    >
                        {t('results.actions.backToHome')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DreamHomeResult;
