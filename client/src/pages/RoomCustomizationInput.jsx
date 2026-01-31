// src/pages/RoomCustomizationInput.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import LoadingOverlay from '../components/LoadingOverlay';

const RoomCustomizationInput = () => {
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 用户需求
    const [roomPurpose, setRoomPurpose] = useState('客厅');
    const [occupants, setOccupants] = useState(2);
    const [stylePreferences, setStylePreferences] = useState([]);
    const [specialNeeds, setSpecialNeeds] = useState([]);
    const [acceptSecondHand, setAcceptSecondHand] = useState(false);
    const [budgetRange, setBudgetRange] = useState('5000-10000');

    // 可选项
    const roomPurposeOptions = ['客厅', '卧室', '书房', '儿童房', '餐厅', '厨房'];
    const styleOptions = ['现代简约', '北欧风格', '工业风', '中式', '日式', '美式'];
    const specialNeedsOptions = ['儿童友好', '宠物友好', '易清洁', '收纳需求大', '在家办公'];
    const budgetOptions = [
        { label: '经济型（3000-5000）', value: '3000-5000' },
        { label: '标准型（5000-10000）', value: '5000-10000' },
        { label: '舒适型（10000-20000）', value: '10000-20000' },
        { label: '豪华型（20000+）', value: '20000-50000' }
    ];

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleStyle = (style) => {
        if (stylePreferences.includes(style)) {
            setStylePreferences(stylePreferences.filter(s => s !== style));
        } else {
            if (stylePreferences.length < 3) {
                setStylePreferences([...stylePreferences, style]);
            }
        }
    };

    const toggleSpecialNeed = (need) => {
        if (specialNeeds.includes(need)) {
            setSpecialNeeds(specialNeeds.filter(n => n !== need));
        } else {
            setSpecialNeeds([...specialNeeds, need]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photo) {
            alert('请上传房间照片');
            return;
        }

        if (stylePreferences.length === 0) {
            alert('请至少选择一种风格偏好');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('photo', photo);
            formData.append('userRequirements', JSON.stringify({
                room_purpose: roomPurpose,
                occupants: occupants,
                style_preferences: stylePreferences,
                special_needs: specialNeeds,
                accept_second_hand: acceptSecondHand,
                budget_range: budgetRange
            }));

            console.log('发送房间定制请求...');

            const response = await fetch('http://localhost:3000/api/v1/room-customization/generate', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('收到响应:', result);

            if (result.success) {
                // 保存结果到 sessionStorage
                sessionStorage.setItem('roomCustomizationResult', JSON.stringify(result.data));
                sessionStorage.setItem('roomCustomizationOriginalPhoto', photoPreview);

                // 跳转到结果页
                setTimeout(() => {
                    navigate('/room-customization/result');
                }, 100);
            } else {
                alert('生成失败：' + (result.message || '未知错误'));
            }
        } catch (error) {
            console.error('生成定制方案失败:', error);
            alert('网络错误，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && (
                <LoadingOverlay
                    isLoading={isLoading}
                    message="AI 正在为您定制专属方案..."
                    duration={60000}
                />
            )}
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-blue-50 p-4 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* 返回按钮 */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        返回主页
                    </button>

                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <Logo />
                    </div>

                    {/* 标题 */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                🏠 房间风格定制
                            </span>
                        </h1>
                        <p className="text-gray-600 text-lg">告诉我们您的需求，AI 为您打造专属空间</p>
                    </div>

                    {/* 表单 */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
                        {/* 照片上传 */}
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                📸 上传房间照片 <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
                                {photoPreview ? (
                                    <div className="relative">
                                        <img src={photoPreview} alt="预览" className="max-h-64 mx-auto rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPhoto(null);
                                                setPhotoPreview(null);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                        <div className="text-indigo-600 text-lg">
                                            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            点击上传硬装完成后的房间照片
                                        </div>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* 房间用途 */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                🏡 房间用途 <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                {roomPurposeOptions.map(purpose => (
                                    <button
                                        key={purpose}
                                        type="button"
                                        onClick={() => setRoomPurpose(purpose)}
                                        className={`py-2 px-4 rounded-lg font-medium transition-all ${roomPurpose === purpose
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {purpose}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 居住人数 */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                👥 居住人数
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={occupants}
                                onChange={(e) => setOccupants(parseInt(e.target.value))}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        {/* 风格偏好 */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                🎨 风格偏好 <span className="text-red-500">*</span>
                                <span className="text-sm text-gray-500 ml-2">（最多选择3个）</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {styleOptions.map(style => (
                                    <button
                                        key={style}
                                        type="button"
                                        onClick={() => toggleStyle(style)}
                                        className={`py-2 px-4 rounded-lg font-medium transition-all ${stylePreferences.includes(style)
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 特殊需求 */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                ⭐ 特殊需求
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {specialNeedsOptions.map(need => (
                                    <button
                                        key={need}
                                        type="button"
                                        onClick={() => toggleSpecialNeed(need)}
                                        className={`py-2 px-4 rounded-lg font-medium transition-all ${specialNeeds.includes(need)
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {need}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 预算范围 */}
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                💰 预算范围
                            </label>
                            <select
                                value={budgetRange}
                                onChange={(e) => setBudgetRange(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            >
                                {budgetOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 是否接受二手 */}
                        <div className="mb-8">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={acceptSecondHand}
                                    onChange={(e) => setAcceptSecondHand(e.target.checked)}
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="ml-3 text-gray-700 font-medium">
                                    ♻️ 接受二手家具（更环保、更经济）
                                </span>
                            </label>
                        </div>

                        {/* 提交按钮 */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-6 rounded-xl shadow-lg text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '生成中...' : '✨ 生成专属定制方案'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default RoomCustomizationInput;
