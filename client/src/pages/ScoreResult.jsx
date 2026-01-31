// src/pages/ScoreResult.jsx

import React, { useEffect, useState, useRef } from 'react';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';

const ScoreResult = () => {
    const [data, setData] = useState(null);
    const [userPhoto, setUserPhoto] = useState(null);
    const [isSharing, setIsSharing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);  // 生成梦中情家状态
    const navigate = useNavigate();
    const hasLoadedData = useRef(false); // 标记数据是否已加载

    // 分享功能
    const handleShare = async () => {
        setIsSharing(true);
        try {
            // 动态导入 html2canvas
            const html2canvas = (await import('html2canvas')).default;

            // 获取要截图的元素
            const element = document.getElementById('score-result-content');
            if (!element) {
                alert('无法生成分享图片');
                return;
            }

            // 找到所有使用 bg-clip-text 的元素并临时替换样式
            const gradientTextElements = element.querySelectorAll('.bg-clip-text');
            const originalStyles = [];

            gradientTextElements.forEach((el, index) => {
                // 保存原始样式
                originalStyles[index] = {
                    backgroundClip: el.style.backgroundClip,
                    webkitBackgroundClip: el.style.webkitBackgroundClip,
                    color: el.style.color,
                    className: el.className
                };

                // 临时替换为纯色
                el.style.backgroundClip = 'unset';
                el.style.webkitBackgroundClip = 'unset';
                el.style.color = '#FF8C00';
                el.classList.remove('text-transparent');
            });

            // 生成canvas
            const canvas = await html2canvas(element, {
                backgroundColor: '#f9fafb',
                scale: 2, // 提高清晰度
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            // 恢复原始样式
            gradientTextElements.forEach((el, index) => {
                const original = originalStyles[index];
                el.style.backgroundClip = original.backgroundClip;
                el.style.webkitBackgroundClip = original.webkitBackgroundClip;
                el.style.color = original.color;
                el.className = original.className;
            });

            // 转换为blob
            canvas.toBlob((blob) => {
                if (!blob) {
                    alert('生成图片失败');
                    return;
                }

                // 创建下载链接
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `InstaRoom评分_${new Date().getTime()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                alert('✅ 评分报告已保存到您的设备！');
            }, 'image/jpeg', 0.95);
        } catch (error) {
            console.error('分享失败:', error);
            alert('生成分享图片失败，请重试');
        } finally {
            setIsSharing(false);
        }
    };

    // 生成梦中情家
    const handleGenerateDreamHome = async () => {
        if (!data || !userPhoto) {
            alert('缺少必要数据，请重新评分');
            return;
        }

        setIsGenerating(true);

        try {
            // 将 base64 图片转换为 Blob
            const base64Data = userPhoto.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });

            // 创建 FormData
            const formData = new FormData();
            formData.append('photo', blob, 'room.jpg');

            // 调试：查看 data 的结构
            console.log('准备发送的评分数据:', data);
            console.log('评分:', data.score || data.total_score);
            console.log('优化建议:', data.suggestions || data.improvement_suggestions);

            formData.append('scoreData', JSON.stringify(data));

            console.log('发送梦中情家生成请求...');

            // 调用 API
            const response = await fetch('http://localhost:3000/api/v1/dream-home/generate', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('收到响应:', result);

            if (result.success) {
                try {
                    // 使用 sessionStorage 存储大数据（配额更大）
                    sessionStorage.setItem('dreamHomeResult', JSON.stringify(result.data));
                    sessionStorage.setItem('dreamHomeOriginalPhoto', userPhoto);

                    // 跳转到结果页
                    setTimeout(() => {
                        navigate('/dream-home/result');
                    }, 100);
                } catch (storageError) {
                    console.error('存储数据失败:', storageError);
                    // 如果存储失败，尝试压缩数据或直接通过 state 传递
                    alert('数据过大，正在尝试其他方式...');

                    // 清理可能的旧数据
                    sessionStorage.removeItem('dreamHomeResult');
                    sessionStorage.removeItem('dreamHomeOriginalPhoto');

                    // 重新尝试
                    sessionStorage.setItem('dreamHomeResult', JSON.stringify(result.data));
                    sessionStorage.setItem('dreamHomeOriginalPhoto', userPhoto);

                    navigate('/dream-home/result');
                }
            } else {
                alert('生成失败：' + (result.message || '未知错误'));
            }
        } catch (error) {
            console.error('生成梦中情家失败:', error);
            alert('网络错误，请稍后重试');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        // 只在第一次加载时读取数据
        if (hasLoadedData.current) {
            console.log('数据已加载，跳过重复加载');
            return;
        }

        const resultDataString = localStorage.getItem('scoringResult');
        const photoDataUrl = localStorage.getItem('scoringPhoto');
        console.log('ScoreResult mounted, localStorage data:', resultDataString);

        if (!resultDataString) {
            alert('未找到评分数据，请重新上传照片。');
            navigate('/score/input');
            return;
        }

        try {
            const resultData = JSON.parse(resultDataString);
            console.log('Parsed result data:', resultData);
            setData(resultData);

            // 设置用户照片
            if (photoDataUrl) {
                setUserPhoto(photoDataUrl);
            }

            // 标记数据已加载
            hasLoadedData.current = true;

            // 组件卸载时清理 localStorage
            return () => {
                console.log('组件卸载，清理 localStorage');
                localStorage.removeItem('scoringResult');
                localStorage.removeItem('scoringPhoto');
                console.log('localStorage 已清理（组件卸载）');
            };
        } catch (error) {
            console.error('Error parsing result data:', error);
            alert('数据解析错误，请重新上传照片。');
            navigate('/score/input');
        }
    }, [navigate]);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF8C00] mx-auto mb-4"></div>
                    <p className="text-gray-600">加载评分结果中...</p>
                </div>
            </div>
        );
    }

    const scoreMap = {
        "Functional_Score": { label: "功能性", color: "from-blue-400 to-blue-600" },
        "Aesthetics_Score": { label: "美观度", color: "from-purple-400 to-purple-600" },
        "Lighting_Score": { label: "照明氛围", color: "from-yellow-400 to-yellow-600" },
        "Overall_Design_Score": { label: "整体设计", color: "from-green-400 to-green-600" }
    };

    // 圆形仪表盘组件
    const CircularGauge = ({ score, label, color, delay }) => {
        const [animatedScore, setAnimatedScore] = useState(0);
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (animatedScore / 100) * circumference;

        useEffect(() => {
            const timer = setTimeout(() => {
                let current = 0;
                const increment = score / 50; // 50 frames animation
                const interval = setInterval(() => {
                    current += increment;
                    if (current >= score) {
                        setAnimatedScore(score);
                        clearInterval(interval);
                    } else {
                        setAnimatedScore(Math.floor(current));
                    }
                }, 20);
                return () => clearInterval(interval);
            }, delay);
            return () => clearTimeout(timer);
        }, [score, delay]);

        return (
            <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                        {/* Background circle */}
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke={`url(#gradient-${label})`}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" className={`bg-gradient-to-r ${color}`} stopColor="#FF8C00" />
                                <stop offset="100%" className={`bg-gradient-to-r ${color}`} stopColor="#cc7000" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Score text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">{animatedScore}</span>
                    </div>
                </div>
                <p className="mt-3 text-sm font-medium text-gray-700">{label}</p>
            </div>
        );
    };

    return (
        <>
            {isGenerating && (
                <LoadingOverlay
                    isLoading={isGenerating}
                    message="AI 正在生成您的梦中情家..."
                    duration={45000}
                />
            )}
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100 p-4 pb-12">
                <div className="max-w-4xl mx-auto" id="score-result-content">
                    {/* 返回主页按钮 */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-600 hover:text-[#FF8C00] transition-colors duration-200 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        返回主页
                    </button>

                    <Logo />

                    {/* 空间叙事卡片 - 新增 */}
                    {data.narrative_opening && (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl shadow-lg p-6 md:p-8 mb-6 border border-orange-100 animate-fadeInUp">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#FF8C00] to-[#cc7000] rounded-full flex items-center justify-center mr-3 md:mr-4">
                                    <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xs md:text-sm font-semibold text-[#FF8C00] mb-2 tracking-wide">对您房间的第一印象</h3>
                                    <p className="text-base md:text-lg leading-relaxed text-gray-700 font-serif italic">
                                        "{data.narrative_opening}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 用户照片展示卡片 - 新增 */}
                    {userPhoto && (
                        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-6 overflow-hidden">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">您的空间</h3>
                            <div className="relative rounded-2xl overflow-hidden">
                                <img
                                    src={userPhoto}
                                    alt="用户上传的房间照片"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* 总分展示卡片 */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden">
                        {/* 装饰性背景 */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100 to-transparent rounded-full blur-3xl opacity-50"></div>

                        <div className="relative z-10 text-center">
                            <p className="text-sm font-medium text-gray-500 mb-2">AI 智能评分</p>
                            <div className="inline-block">
                                <div className="relative">
                                    <span className="text-8xl font-extrabold bg-gradient-to-r from-[#FF8C00] to-[#cc7000] bg-clip-text text-transparent">
                                        {data.total_score}
                                    </span>
                                    <span className="text-3xl font-bold text-gray-400 ml-2">/ 100</span>
                                </div>
                            </div>

                            <div className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-full">
                                <svg className="w-5 h-5 text-[#FF8C00] mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-700">
                                    风格识别：<span className="text-[#FF8C00]">{data.inherent_style}</span>
                                </span>
                            </div>

                            <p className="mt-6 text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                {data.summary_text}
                            </p>
                        </div>
                    </div>

                    {/* 四维度仪表盘 */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 text-center">
                            详细评分分析
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {Object.entries(data.scores).map(([key, score], index) => (
                                <CircularGauge
                                    key={key}
                                    score={score}
                                    label={scoreMap[key].label}
                                    color={scoreMap[key].color}
                                    delay={index * 200}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 改进建议区 */}
                    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                        <div className="flex items-center mb-6">
                            <div className="w-1 h-8 bg-gradient-to-b from-[#FF8C00] to-[#cc7000] rounded-full mr-4"></div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900">
                                专业改进建议
                            </h2>
                        </div>

                        <div className="inline-flex items-center px-4 py-2 bg-orange-50 rounded-full mb-6">
                            <svg className="w-5 h-5 text-[#FF8C00] mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">
                                重点关注：<span className="text-[#FF8C00] font-semibold">{data.key_suggestion_category}</span>
                            </span>
                        </div>

                        <div className="space-y-4">
                            {data.improvement_suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors duration-200"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#FF8C00] to-[#cc7000] rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                                        {index + 1}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed flex-1">
                                        {suggestion.replace(/^建议 \d+：/, '')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA 按钮区 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={handleGenerateDreamHome}
                            disabled={isGenerating}
                            className="w-full py-4 px-6 rounded-xl shadow-lg text-lg font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? '生成中...' : '✨ 一键生成梦中情家'}
                        </button>
                        <button
                            onClick={() => navigate('/placement/input')}
                            className="w-full py-4 px-6 rounded-xl shadow-lg text-lg font-medium text-white bg-gradient-to-r from-[#FF8C00] to-[#cc7000] hover:from-[#cc7000] hover:to-[#FF8C00] transition-all duration-200"
                        >
                            开始家具置换 →
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="w-full py-4 px-6 rounded-xl shadow-lg text-lg font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSharing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    分享报告
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ScoreResult;