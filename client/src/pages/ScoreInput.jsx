// src/pages/ScoreInput.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';
import Button from '../components/Button';
import LoadingOverlay from '../components/LoadingOverlay';

// 模拟后端 API 地址
const API_ENDPOINT = 'http://localhost:3000/api/v1/score';

const ScoreInput = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(['scoring', 'common']);
    const [photo, setPhoto] = useState(null);
    const [focusArea, setFocusArea] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);

            // 将照片转换为 Data URL 用于后续展示
            const reader = new FileReader();
            reader.onloadend = () => {
                localStorage.setItem('scoringPhoto', reader.result);
                console.log('照片已保存到 localStorage');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photo) {
            alert(t('common:photoRequired'));
            return;
        }

        setIsLoading(true);
        console.log('开始提交评分请求...');

        try {
            const formData = new FormData();
            formData.append('photo', photo);
            if (focusArea) {
                formData.append('focusArea', focusArea);
            }
            // 发送当前语言到后端
            formData.append('language', i18n.language === 'zh' ? 'zh' : 'en');

            console.log('发送请求到:', API_ENDPOINT);
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            console.log('收到响应，状态码:', response.status);
            const result = await response.json();
            console.log('解析后的结果:', result);

            if (result.success) {
                console.log('评分成功，数据:', result.data);

                // 验证数据完整性
                if (!result.data || !result.data.total_score) {
                    console.error('返回的数据格式不正确:', result.data);
                    alert(t('common:error') + ': ' + t('scoring:results.dataError', { defaultValue: '评分数据格式错误，请重试' }));
                    return;
                }

                // 将结果存储到 localStorage
                const dataString = JSON.stringify(result.data);
                localStorage.setItem('scoringResult', dataString);
                console.log('数据已存储到 localStorage');

                // 验证存储是否成功
                const storedData = localStorage.getItem('scoringResult');
                if (storedData) {
                    console.log('验证：localStorage 存储成功，数据长度:', storedData.length);
                } else {
                    console.error('警告：localStorage 存储失败！');
                    alert(t('common:error') + ': ' + t('scoring:results.storageError', { defaultValue: '数据存储失败，请检查浏览器设置' }));
                    return;
                }

                // 延迟跳转，确保 localStorage 写入完成
                console.log('准备跳转到 /score/result');
                setTimeout(() => {
                    navigate('/score/result');
                }, 100); // 100ms 延迟
            } else {
                console.error('评分失败:', result.message);
                alert(t('common:error') + ': ' + (result.message || t('common:error')));
            }
        } catch (error) {
            console.error('提交错误:', error);
            alert(t('scoring:networkError', { defaultValue: '网络错误，请稍后重试' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // 1. 移动端容器和背景
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-start py-8 px-4">
            {/* 加载遮罩 */}
            <LoadingOverlay isLoading={isLoading} message={t('analyzing')} />

            {/* 返回主页按钮 */}
            <div className="w-full max-w-lg mb-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-600 hover:text-[#FF8C00] transition-colors duration-200"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t('common:backToHome')}
                </button>
            </div>

            <div className="w-full max-w-lg">
                <Logo />
            </div>

            {/* 2. 杂志风格标题区 */}
            <header className="w-full max-w-lg text-center mt-6 mb-10">
                <h1 className="font-serif text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                    {t('uploadTitle')}
                </h1>
                <p className="mt-3 text-lg text-gray-500 max-w-sm mx-auto">
                    {t('uploadDescription')}
                </p>
            </header>

            {/* 3. 输入卡片 (强调层次感) */}
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">

                <form onSubmit={handleSubmit} className="space-y-7">

                    {/* 3a. 关注点输入 (卡片风格) */}
                    <div className="p-4 border border-gray-200 rounded-xl">
                        <label htmlFor="focusArea" className="block text-sm font-serif font-semibold text-gray-900 mb-1">
                            {t('focusArea', { defaultValue: '关注点 (可选)' })}
                        </label>
                        <input
                            type="text"
                            id="focusArea"
                            value={focusArea}
                            onChange={(e) => setFocusArea(e.target.value)}
                            placeholder={t('focusAreaPlaceholder', { defaultValue: '例如：收纳空间，照明设计' })}
                            className="w-full border-0 focus:ring-0 p-0 text-base placeholder-gray-400"
                        />
                    </div>

                    {/* 3b. 文件上传区 (突出视觉引导) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-serif font-semibold text-gray-900 mb-1">
                            {t('uploadPhotoLabel', { defaultValue: '拍摄/上传房间照片' })}
                        </label>
                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-[#FF8C00] border-dashed rounded-xl cursor-pointer bg-orange-50/50 hover:bg-orange-100 transition duration-300"
                            onClick={() => document.getElementById('file-upload').click()}>

                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-[#FF8C00]" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H10c-1.1 0-2 .9-2 2v28c0 1.1.9 2 2 2h28c1.1 0 2-.9 2-2V18l-8-8zm-2 0l-8 8v-8h8zM26 18c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4zM24 32h-4v-4h4v4z" />
                                </svg>

                                <p className="text-sm font-medium text-gray-700">
                                    {photo ? `${t('photoSelected', { defaultValue: '已选' })}: ${photo.name}` : t('common:dragDropPhoto')}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {t('photoHint', { defaultValue: '仅支持 JPG, PNG，确保光线充足。' })}
                                </p>
                                <input id="file-upload" name="photo" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>
                    </div>

                    {/* 5. 提交按钮 */}
                    <div className="flex justify-center">
                        <Button
                            onClick={handleSubmit}
                            disabled={!photo || isLoading}
                            className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-[#FF8C00] to-[#cc7000] hover:from-[#cc7000] hover:to-[#FF8C00] text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? t('analyzing') : t('startAnalysis', { defaultValue: '开始 AI 评分' })}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScoreInput;