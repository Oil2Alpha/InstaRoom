// src/pages/PlacementInput.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import LoadingOverlay from '../components/LoadingOverlay';
import DimensionConfirmModal from '../components/DimensionConfirmModal';

const API_MEASURE_ENDPOINT = 'http://localhost:3000/api/v1/placement/measure';
const API_GENERATE_ENDPOINT = 'http://localhost:3000/api/v1/placement/generate';

// 参考物选项
const REFERENCE_OBJECTS = [
    { value: 'Coke_Can', label: '可乐罐 (12.2cm 高)' },
    { value: 'Beer_Can', label: '啤酒罐 (12.2cm 高)' },
    { value: 'A4_Paper', label: 'A4 纸 (29.7cm 长)' },
    { value: 'Chinese_id_card', label: '身份证 (8.56cm 长)' }
];

// 风格偏好选项
const STYLE_OPTIONS = ['现代', '北欧', '日式', '欧式', '中式', '工业风', '轻奢', '简约'];

// 特殊标签选项
const FEATURE_TAGS = ['儿童友好', '女性友好', '耐用', '易清洁', '低碳', '宠物友好'];

const PlacementInput = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    // 基础状态
    const [photos, setPhotos] = useState([]);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 家具信息
    const [furnitureName, setFurnitureName] = useState('');
    const [furnitureDescription, setFurnitureDescription] = useState('');
    const [furnitureBbox, setFurnitureBbox] = useState(null);

    // 标注状态（两点选择）
    const [firstPoint, setFirstPoint] = useState(null);  // 第一个点
    const [annotationStep, setAnnotationStep] = useState(0);  // 0: 未开始, 1: 已选第一个点, 2: 完成

    // 参考物
    const [referenceObject, setReferenceObject] = useState('Coke_Can');

    // 用户偏好
    const [stylePreference, setStylePreference] = useState([]);
    const [preferUsed, setPreferUsed] = useState(false);
    const [featureTags, setFeatureTags] = useState([]);
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');

    // 尺寸确认弹窗
    const [showDimensionModal, setShowDimensionModal] = useState(false);
    const [measuredDimensions, setMeasuredDimensions] = useState(null);
    const [formDataCache, setFormDataCache] = useState(null);  // 缓存表单数据
    const [loadingMessage, setLoadingMessage] = useState('AI 正在分析房间...');
    const [loadingProgress, setLoadingProgress] = useState(null);  // 手动控制进度
    const [loadingDuration, setLoadingDuration] = useState(15000);  // 加载持续时间（15秒）

    // 处理照片上传
    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length < 2) {
            alert('请至少上传2张照片');
            return;
        }
        setPhotos(files);

        // 显示第一张照片用于标注
        const reader = new FileReader();
        reader.onload = (event) => {
            setPhotoPreview(event.target.result);
        };
        reader.readAsDataURL(files[0]);

        // 重置标注状态
        setFirstPoint(null);
        setFurnitureBbox(null);
        setAnnotationStep(0);
    };

    // 在图片上点击标注家具位置（两点选择方式）
    const handleImageClick = (e) => {
        if (!photoPreview) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // 计算缩放比例
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const ctx = canvas.getContext('2d');
        const img = imageRef.current;

        if (annotationStep === 0) {
            // 第一次点击：记录第一个点
            setFirstPoint({ x, y });
            setAnnotationStep(1);

            // 重绘图片
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 绘制第一个点（大一点，更明显）
            ctx.fillStyle = '#FF6B35';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();

            // 绘制点的外圈
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.stroke();

        } else if (annotationStep === 1) {
            // 第二次点击：计算矩形框
            const bbox = {
                x: Math.min(firstPoint.x, x),
                y: Math.min(firstPoint.y, y),
                width: Math.abs(x - firstPoint.x),
                height: Math.abs(y - firstPoint.y)
            };

            setFurnitureBbox(bbox);
            setAnnotationStep(2);

            // 重绘图片
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 绘制矩形框（更粗更明显）
            ctx.strokeStyle = '#FF6B35';
            ctx.lineWidth = 5;
            ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

            // 绘制半透明填充
            ctx.fillStyle = 'rgba(255, 107, 53, 0.15)';
            ctx.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);

            // 绘制两个角点
            [firstPoint, { x, y }].forEach(point => {
                ctx.fillStyle = '#FF6B35';
                ctx.beginPath();
                ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
                ctx.stroke();
            });
        }
    };

    // 重置标注
    const resetAnnotation = () => {
        setFirstPoint(null);
        setFurnitureBbox(null);
        setAnnotationStep(0);

        if (canvasRef.current && imageRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = imageRef.current;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    };

    // 切换风格偏好
    const toggleStyle = (style) => {
        setStylePreference(prev =>
            prev.includes(style)
                ? prev.filter(s => s !== style)
                : [...prev, style]
        );
    };

    // 切换特殊标签
    const toggleFeatureTag = (tag) => {
        setFeatureTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };


    // 提交表单 - 阶段1：测量尺寸
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 验证输入
        if (photos.length < 2) {
            alert('请上传至少2张照片');
            return;
        }
        if (!furnitureName.trim()) {
            alert('请输入家具名称');
            return;
        }
        if (!furnitureBbox) {
            alert('请在照片上点击标注家具位置');
            return;
        }


        setIsLoading(true);
        setLoadingMessage('步骤 1/4: AI 正在测量家具尺寸...');
        setLoadingProgress(null);  // 使用自动进度
        setLoadingDuration(20000);  // 20秒

        try {
            const formData = new FormData();
            photos.forEach(photo => {
                formData.append('photos', photo);
            });

            const inputData = {
                furnitureInfo: {
                    name: furnitureName,
                    description: furnitureDescription,
                    bbox: furnitureBbox
                },
                referenceObject,
                preferences: {
                    stylePreference,
                    preferUsed,
                    featureTags,
                    budgetRange: budgetMin && budgetMax ? {
                        min: parseInt(budgetMin),
                        max: parseInt(budgetMax)
                    } : null
                }
            };

            formData.append('inputData', JSON.stringify(inputData));

            console.log('步骤1: 发送尺寸测量请求...', inputData);

            // 调用步骤1 API：测量尺寸
            const response = await fetch(API_MEASURE_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('步骤1完成，收到尺寸:', result);

            if (result.success) {
                // 缓存表单数据和尺寸
                setFormDataCache(formData);
                setMeasuredDimensions(result.data.dimensions);

                // 设置进度为100%
                setLoadingProgress(100);
                setLoadingMessage('步骤 1/4: 尺寸测量完成！');

                // 延迟500ms后关闭加载，显示尺寸确认弹窗
                setTimeout(() => {
                    setIsLoading(false);
                    setLoadingProgress(null);
                    setShowDimensionModal(true);
                }, 500);
            } else {
                alert('尺寸测量失败：' + (result.message || '未知错误'));
                setIsLoading(false);
                setLoadingProgress(null);
            }
        } catch (error) {
            console.error('尺寸测量错误:', error);
            alert('网络错误，请稍后重试');
            setIsLoading(false);
            setLoadingProgress(null);
        }
    };

    // 尺寸确认后 - 阶段2：生成完整方案
    const handleDimensionConfirm = async (confirmedDimensions) => {
        setShowDimensionModal(false);
        setIsLoading(true);
        setLoadingMessage('步骤 2-4: AI 正在生成置换方案...');
        setLoadingProgress(null);  // 重置为自动进度
        setLoadingDuration(45000);  // 45秒，更长的等待时间

        try {
            // 使用确认的尺寸更新 inputData
            const inputData = JSON.parse(formDataCache.get('inputData'));
            inputData.confirmedDimensions = confirmedDimensions;

            // 重新构建 formData
            const newFormData = new FormData();
            photos.forEach(photo => {
                newFormData.append('photos', photo);
            });
            newFormData.append('inputData', JSON.stringify(inputData));

            console.log('步骤2-4: 发送完整生成请求...', inputData);

            // 调用完整流程 API
            const response = await fetch(API_GENERATE_ENDPOINT, {
                method: 'POST',
                body: newFormData
            });

            const result = await response.json();
            console.log('收到完整响应:', result);

            if (result.success) {
                // 保存结果到 localStorage
                localStorage.setItem('placementResult', JSON.stringify(result.data));
                localStorage.setItem('placementPhoto', photoPreview);

                // 跳转到结果页
                setTimeout(() => {
                    navigate('/placement/result');
                }, 100);
            } else {
                alert('生成方案失败：' + (result.message || '未知错误'));
            }
        } catch (error) {
            console.error('生成方案错误:', error);
            alert('网络错误，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    // 取消尺寸确认
    const handleDimensionCancel = () => {
        setShowDimensionModal(false);
        setFormDataCache(null);
        setMeasuredDimensions(null);
    };

    // 图片加载完成后初始化 canvas
    const handleImageLoad = () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (canvas && img) {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 relative">
            {isLoading && (
                <LoadingOverlay
                    isLoading={isLoading}
                    message={loadingMessage}
                    progress={loadingProgress}
                    duration={loadingDuration}
                />
            )}

            {/* 尺寸确认弹窗 */}
            <DimensionConfirmModal
                isOpen={showDimensionModal}
                dimensions={measuredDimensions}
                onConfirm={handleDimensionConfirm}
                onCancel={handleDimensionCancel}
            />

            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            {/* 内容容器 */}
            <div className="relative max-w-4xl mx-auto p-6">
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
                        AI 家具置换
                    </h1>
                    <p className="text-gray-600">上传照片，让 AI 为您设计全新的家具方案</p>
                </div>

                {/* 表单 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 步骤 1: 上传照片 */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            上传房间照片（至少2张）
                        </h2>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        />
                        {photos.length > 0 && (
                            <p className="mt-2 text-sm text-green-600">✓ 已选择 {photos.length} 张照片</p>
                        )}
                    </div>

                    {/* 步骤 2: 标注家具位置 */}
                    {photoPreview && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                点击照片标注家具位置
                            </h2>

                            {/* 交互提示 */}
                            <div className="mb-4 text-sm text-gray-600">
                                {annotationStep === 0 && (
                                    <p className="flex items-center gap-2">
                                        <span className="text-orange-500">●</span>
                                        <span>请点击家具的<strong>左上角</strong>位置</span>
                                    </p>
                                )}
                                {annotationStep === 1 && (
                                    <p className="flex items-center gap-2 text-orange-600 font-medium animate-pulse">
                                        <span>●</span>
                                        <span>很好！现在点击家具的<strong>右下角</strong>位置</span>
                                    </p>
                                )}
                                {annotationStep === 2 && (
                                    <p className="flex items-center gap-2 text-green-600 font-medium">
                                        <span>✓</span>
                                        <span>标注完成！如需重新标注，请点击下方"重新标注"按钮</span>
                                    </p>
                                )}
                            </div>

                            <div className="relative inline-block">
                                <img
                                    ref={imageRef}
                                    src={photoPreview}
                                    alt="房间照片"
                                    className="max-w-full h-auto hidden"
                                    onLoad={handleImageLoad}
                                />
                                <canvas
                                    ref={canvasRef}
                                    onClick={handleImageClick}
                                    className={`max-w-full h-auto border-2 rounded-lg transition-all ${annotationStep === 2
                                        ? 'border-green-400 cursor-default'
                                        : 'border-orange-300 cursor-crosshair hover:border-orange-500'
                                        }`}
                                />
                            </div>

                            {/* 重置按钮 */}
                            {annotationStep > 0 && (
                                <div className="mt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={resetAnnotation}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                        🔄 重新标注
                                    </button>
                                    {furnitureBbox && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span>标注区域：</span>
                                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                                {Math.round(furnitureBbox.width)} × {Math.round(furnitureBbox.height)} px
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 步骤 3: 家具信息 */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                            家具信息
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    家具名称 *
                                </label>
                                <input
                                    type="text"
                                    value={furnitureName}
                                    onChange={(e) => setFurnitureName(e.target.value)}
                                    placeholder="例如：沙发、茶几、床..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    家具描述（可选）
                                </label>
                                <input
                                    type="text"
                                    value={furnitureDescription}
                                    onChange={(e) => setFurnitureDescription(e.target.value)}
                                    placeholder="例如：靠墙的灰色沙发"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    参考物（用于尺寸测量）
                                </label>
                                <select
                                    value={referenceObject}
                                    onChange={(e) => setReferenceObject(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    {REFERENCE_OBJECTS.map(obj => (
                                        <option key={obj.value} value={obj.value}>{obj.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 步骤 4: 偏好设置 */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                            偏好设置
                        </h2>

                        {/* 风格偏好 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">风格偏好</label>
                            <div className="flex flex-wrap gap-2">
                                {STYLE_OPTIONS.map(style => (
                                    <button
                                        key={style}
                                        type="button"
                                        onClick={() => toggleStyle(style)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${stylePreference.includes(style)
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 特殊标签 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">特殊需求</label>
                            <div className="flex flex-wrap gap-2">
                                {FEATURE_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleFeatureTag(tag)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${featureTags.includes(tag)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 二手优先 */}
                        <div className="mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferUsed}
                                    onChange={(e) => setPreferUsed(e.target.checked)}
                                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm font-medium text-gray-700">优先推荐二手家具</span>
                            </label>
                        </div>

                        {/* 预算范围 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">预算范围（可选）</label>
                            <div className="flex items-center gap-2 sm:gap-3 max-w-md">
                                <input
                                    type="number"
                                    value={budgetMin}
                                    onChange={(e) => setBudgetMin(e.target.value)}
                                    placeholder="最低价格"
                                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                />
                                <span className="text-gray-500 flex-shrink-0">-</span>
                                <input
                                    type="number"
                                    value={budgetMax}
                                    onChange={(e) => setBudgetMax(e.target.value)}
                                    placeholder="最高价格"
                                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 提交按钮 */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-12 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '生成中...' : '生成置换方案'}
                        </button>
                    </div>
                </form>

                {/* 说明文字 */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    * AI 将分析您的房间并生成 2 套不同风格的家具置换方案
                </p>
            </div>
        </div>
    );
};

export default PlacementInput;