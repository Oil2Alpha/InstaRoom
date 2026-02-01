// src/pages/PlacementInput.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';
import LoadingOverlay from '../components/LoadingOverlay';
import DimensionConfirmModal from '../components/DimensionConfirmModal';

const API_MEASURE_ENDPOINT = 'http://localhost:3000/api/v1/placement/measure';
const API_GENERATE_ENDPOINT = 'http://localhost:3000/api/v1/placement/generate';

const PlacementInput = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(['placement', 'common']);
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

    // 标注状态
    const [firstPoint, setFirstPoint] = useState(null);
    const [annotationStep, setAnnotationStep] = useState(0);

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
    const [formDataCache, setFormDataCache] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(null);
    const [loadingDuration, setLoadingDuration] = useState(15000);

    // 风格选项 - 使用 key 映射
    const STYLE_OPTIONS = [
        { key: 'modern', zhLabel: '现代' },
        { key: 'nordic', zhLabel: '北欧' },
        { key: 'japanese', zhLabel: '日式' },
        { key: 'european', zhLabel: '欧式' },
        { key: 'chinese', zhLabel: '中式' },
        { key: 'industrial', zhLabel: '工业风' },
        { key: 'luxury', zhLabel: '轻奢' },
        { key: 'minimalist', zhLabel: '简约' }
    ];

    // 特殊标签选项
    const FEATURE_TAGS = [
        { key: 'childFriendly', zhLabel: '儿童友好' },
        { key: 'femaleFriendly', zhLabel: '女性友好' },
        { key: 'durable', zhLabel: '耐用' },
        { key: 'easyClean', zhLabel: '易清洁' },
        { key: 'lowCarbon', zhLabel: '低碳' },
        { key: 'petFriendly', zhLabel: '宠物友好' }
    ];

    // 参考物选项
    const REFERENCE_OBJECTS = [
        { value: 'Coke_Can', key: 'Coke_Can' },
        { value: 'Beer_Can', key: 'Beer_Can' },
        { value: 'A4_Paper', key: 'A4_Paper' },
        { value: 'Chinese_id_card', key: 'Chinese_id_card' }
    ];

    // 处理照片上传
    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length < 2) {
            alert(t('alerts.photosRequired'));
            return;
        }
        setPhotos(files);

        const reader = new FileReader();
        reader.onload = (event) => {
            setPhotoPreview(event.target.result);
        };
        reader.readAsDataURL(files[0]);

        setFirstPoint(null);
        setFurnitureBbox(null);
        setAnnotationStep(0);
    };

    // 在图片上点击标注家具位置
    const handleImageClick = (e) => {
        if (!photoPreview) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const ctx = canvas.getContext('2d');
        const img = imageRef.current;

        if (annotationStep === 0) {
            setFirstPoint({ x, y });
            setAnnotationStep(1);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#FF6B35';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();

            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.stroke();

        } else if (annotationStep === 1) {
            const bbox = {
                x: Math.min(firstPoint.x, x),
                y: Math.min(firstPoint.y, y),
                width: Math.abs(x - firstPoint.x),
                height: Math.abs(y - firstPoint.y)
            };

            setFurnitureBbox(bbox);
            setAnnotationStep(2);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#FF6B35';
            ctx.lineWidth = 5;
            ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);

            ctx.fillStyle = 'rgba(255, 107, 53, 0.15)';
            ctx.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);

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
    const toggleStyle = (styleKey) => {
        setStylePreference(prev =>
            prev.includes(styleKey)
                ? prev.filter(s => s !== styleKey)
                : [...prev, styleKey]
        );
    };

    // 切换特殊标签
    const toggleFeatureTag = (tagKey) => {
        setFeatureTags(prev =>
            prev.includes(tagKey)
                ? prev.filter(t => t !== tagKey)
                : [...prev, tagKey]
        );
    };

    // 提交表单 - 阶段1：测量尺寸
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (photos.length < 2) {
            alert(t('alerts.photosRequired'));
            return;
        }
        if (!furnitureName.trim()) {
            alert(t('alerts.nameRequired'));
            return;
        }
        if (!furnitureBbox) {
            alert(t('alerts.annotationRequired'));
            return;
        }

        setIsLoading(true);
        setLoadingMessage(t('loading.step1'));
        setLoadingProgress(null);
        setLoadingDuration(20000);

        try {
            const formData = new FormData();
            photos.forEach(photo => {
                formData.append('photos', photo);
            });

            // 将风格 key 转换为中文发送到后端
            const stylePrefLabels = stylePreference.map(key => {
                const style = STYLE_OPTIONS.find(s => s.key === key);
                return style ? style.zhLabel : key;
            });
            const featureTagLabels = featureTags.map(key => {
                const tag = FEATURE_TAGS.find(t => t.key === key);
                return tag ? tag.zhLabel : key;
            });

            const inputData = {
                furnitureInfo: {
                    name: furnitureName,
                    description: furnitureDescription,
                    bbox: furnitureBbox
                },
                referenceObject,
                preferences: {
                    stylePreference: stylePrefLabels,
                    preferUsed,
                    featureTags: featureTagLabels,
                    budgetRange: budgetMin && budgetMax ? {
                        min: parseInt(budgetMin),
                        max: parseInt(budgetMax)
                    } : null
                },
                language: i18n.language === 'zh' ? 'zh' : 'en'
            };

            formData.append('inputData', JSON.stringify(inputData));

            console.log('Step 1: Sending dimension measurement request...', inputData);

            const response = await fetch(API_MEASURE_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('Step 1 complete, dimensions received:', result);

            if (result.success) {
                setFormDataCache(formData);
                setMeasuredDimensions(result.data.dimensions);

                setLoadingProgress(100);
                setLoadingMessage(t('loading.step1Complete'));

                setTimeout(() => {
                    setIsLoading(false);
                    setLoadingProgress(null);
                    setShowDimensionModal(true);
                }, 500);
            } else {
                alert(t('alerts.measureFailed') + (result.message || t('common:unknownError')));
                setIsLoading(false);
                setLoadingProgress(null);
            }
        } catch (error) {
            console.error('Dimension measurement error:', error);
            alert(t('alerts.networkError'));
            setIsLoading(false);
            setLoadingProgress(null);
        }
    };

    // 尺寸确认后 - 阶段2：生成完整方案
    const handleDimensionConfirm = async (confirmedDimensions) => {
        setShowDimensionModal(false);
        setIsLoading(true);
        setLoadingMessage(t('loading.step2to4'));
        setLoadingProgress(null);
        setLoadingDuration(45000);

        try {
            const inputData = JSON.parse(formDataCache.get('inputData'));
            inputData.confirmedDimensions = confirmedDimensions;

            const newFormData = new FormData();
            photos.forEach(photo => {
                newFormData.append('photos', photo);
            });
            newFormData.append('inputData', JSON.stringify(inputData));

            console.log('Step 2-4: Sending full generation request...', inputData);

            const response = await fetch(API_GENERATE_ENDPOINT, {
                method: 'POST',
                body: newFormData
            });

            const result = await response.json();
            console.log('Full response received:', result);

            if (result.success) {
                localStorage.setItem('placementResult', JSON.stringify(result.data));
                localStorage.setItem('placementPhoto', photoPreview);

                setTimeout(() => {
                    navigate('/placement/result');
                }, 100);
            } else {
                alert(t('alerts.generateFailed') + (result.message || t('common:unknownError')));
            }
        } catch (error) {
            console.error('Generation error:', error);
            alert(t('alerts.networkError'));
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
                    <span>{t('input.backToHome')}</span>
                </button>

                {/* 标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        {t('title')}
                    </h1>
                    <p className="text-gray-600">{t('subtitle')}</p>
                </div>

                {/* 表单 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 步骤 1: 上传照片 */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            {t('input.uploadPhoto')}
                        </h2>
                        {/* 自定义文件上传组件 */}
                        <div className="flex flex-wrap items-center gap-4">
                            <label className="cursor-pointer px-6 py-2 bg-orange-50 text-orange-700 rounded-full font-semibold text-sm hover:bg-orange-100 transition-colors">
                                {t('input.chooseFiles')}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-sm text-gray-500">
                                {photos.length === 0
                                    ? t('input.noFilesChosen')
                                    : `${photos.length} ${t('input.filesChosen')}`
                                }
                            </span>
                        </div>
                        {photos.length > 0 && (
                            <p className="mt-2 text-sm text-green-600">✓ {photos.length} {t('input.photosSelected')}</p>
                        )}
                    </div>

                    {/* 步骤 2: 标注家具位置 */}
                    {photoPreview && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                {t('input.annotate.title')}
                            </h2>

                            {/* 交互提示 */}
                            <div className="mb-4 text-sm text-gray-600">
                                {annotationStep === 0 && (
                                    <p className="flex items-center gap-2" dangerouslySetInnerHTML={{
                                        __html: `<span class="text-orange-500">●</span> ${t('input.annotate.step1')}`
                                    }} />
                                )}
                                {annotationStep === 1 && (
                                    <p className="flex items-center gap-2 text-orange-600 font-medium animate-pulse" dangerouslySetInnerHTML={{
                                        __html: `<span>●</span> ${t('input.annotate.step2')}`
                                    }} />
                                )}
                                {annotationStep === 2 && (
                                    <p className="flex items-center gap-2 text-green-600 font-medium">
                                        <span>✓</span>
                                        <span>{t('input.annotate.complete')}</span>
                                    </p>
                                )}
                            </div>

                            <div className="relative inline-block">
                                <img
                                    ref={imageRef}
                                    src={photoPreview}
                                    alt="Room"
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
                                        {t('input.annotate.reset')}
                                    </button>
                                    {furnitureBbox && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span>{t('input.annotate.area')}</span>
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
                            {t('input.furnitureInfo.title')}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('input.furnitureInfo.name')}
                                </label>
                                <input
                                    type="text"
                                    value={furnitureName}
                                    onChange={(e) => setFurnitureName(e.target.value)}
                                    placeholder={t('input.furnitureInfo.namePlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('input.furnitureInfo.description')}
                                </label>
                                <input
                                    type="text"
                                    value={furnitureDescription}
                                    onChange={(e) => setFurnitureDescription(e.target.value)}
                                    placeholder={t('input.furnitureInfo.descriptionPlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('input.furnitureInfo.reference')}
                                </label>
                                <select
                                    value={referenceObject}
                                    onChange={(e) => setReferenceObject(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    {REFERENCE_OBJECTS.map(obj => (
                                        <option key={obj.value} value={obj.value}>
                                            {t(`input.furnitureInfo.referenceObjects.${obj.key}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 步骤 4: 偏好设置 */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                            {t('input.preferences.title')}
                        </h2>

                        {/* 风格偏好 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('input.preferences.style')}</label>
                            <div className="flex flex-wrap gap-2">
                                {STYLE_OPTIONS.map(style => (
                                    <button
                                        key={style.key}
                                        type="button"
                                        onClick={() => toggleStyle(style.key)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${stylePreference.includes(style.key)
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {t(`input.preferences.styles.${style.key}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 特殊标签 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('input.preferences.features')}</label>
                            <div className="flex flex-wrap gap-2">
                                {FEATURE_TAGS.map(tag => (
                                    <button
                                        key={tag.key}
                                        type="button"
                                        onClick={() => toggleFeatureTag(tag.key)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${featureTags.includes(tag.key)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {t(`input.preferences.featureTags.${tag.key}`)}
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
                                <span className="text-sm font-medium text-gray-700">{t('input.preferences.preferUsed')}</span>
                            </label>
                        </div>

                        {/* 预算范围 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('input.preferences.budget')}</label>
                            <div className="flex items-center gap-2 sm:gap-3 max-w-md">
                                <input
                                    type="number"
                                    value={budgetMin}
                                    onChange={(e) => setBudgetMin(e.target.value)}
                                    placeholder={t('input.preferences.budgetMin')}
                                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                />
                                <span className="text-gray-500 flex-shrink-0">-</span>
                                <input
                                    type="number"
                                    value={budgetMax}
                                    onChange={(e) => setBudgetMax(e.target.value)}
                                    placeholder={t('input.preferences.budgetMax')}
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
                            {isLoading ? t('input.submitting') : t('input.submit')}
                        </button>
                    </div>
                </form>

                {/* 说明文字 */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    {t('hint')}
                </p>
            </div>
        </div>
    );
};

export default PlacementInput;