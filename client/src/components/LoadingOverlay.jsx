// src/components/LoadingOverlay.jsx
import React, { useEffect, useState } from 'react';

const LoadingOverlay = ({
    isLoading,
    message,  // 自定义消息
    progress: externalProgress,  // 外部控制的进度（0-100）
    duration = 7000  // 默认持续时间（毫秒）
}) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    // 家具置换的加载步骤（有趣版）
    const placementSteps = [
        { icon: '📸', text: '正在分析上传的照片...' },
        { icon: '📏', text: 'AI 正在拿着卷尺测量家具...' },
        { icon: '🤔', text: 'AI 正在思考这个沙发有多重...' },
        { icon: '🏠', text: 'AI 跑去家具城逛了一圈...' },
        { icon: '🎨', text: '正在翻阅家居杂志找灵感...' },
        { icon: '☕', text: 'AI 喝了口咖啡，继续工作...' },
        { icon: '💡', text: '灵感来了！正在生成方案...' },
        { icon: '🛋️', text: 'AI 正在搬运虚拟家具...' },
        { icon: '✨', text: '给效果图加点魔法特效...' },
        { icon: '🛍️', text: '正在电商平台疯狂比价...' },
        { icon: '🎯', text: '精挑细选最适合您的家具...' },
        { icon: '🎁', text: '马上就好，正在打包方案...' }
    ];

    // 房间评分的加载步骤（有趣版）
    const scoringSteps = [
        { icon: '🔍', text: '正在分析房间光影...' },
        { icon: '👀', text: 'AI 正在仔细打量您的房间...' },
        { icon: '🎨', text: '识别空间风格...' },
        { icon: '🤓', text: 'AI 戴上眼镜，认真评分中...' },
        { icon: '📐', text: '评估家具布局...' },
        { icon: '🧐', text: 'AI 正在挑剔地检查细节...' },
        { icon: '💡', text: '检测照明氛围...' },
        { icon: '☕', text: 'AI 摸了个鱼，喝口茶...' },
        { icon: '✨', text: '生成改进建议...' },
        { icon: '📝', text: 'AI 正在写评语，措辞要优雅...' },
        { icon: '🎯', text: '计算综合评分...' },
        { icon: '🎉', text: '即将揭晓您的房间得分...' }
    ];

    // 根据消息判断使用哪组步骤
    const loadingSteps = message && (message.includes('置换') || message.includes('家具') || message.includes('尺寸'))
        ? placementSteps
        : scoringSteps;

    useEffect(() => {
        if (!isLoading) {
            setProgress(0);
            setCurrentStep(0);
            return;
        }

        // 如果有外部进度控制，使用外部进度
        if (externalProgress !== undefined && externalProgress !== null) {
            setProgress(externalProgress);
            return;
        }

        // 否则使用自动进度动画
        const increment = 100 / (duration / 100); // 每100ms增加的百分比
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + increment;
            });
        }, 100);

        // 文字切换动画（每1秒切换一次，更慢更从容）
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % loadingSteps.length);
        }, 1000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
        };
    }, [isLoading, externalProgress, duration, loadingSteps.length]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md animate-fadeIn">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full mx-4 border border-white/50">
                {/* 图标和文字 */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 animate-bounce">
                        {loadingSteps[currentStep].icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {message || 'AI 正在分析您的空间'}
                    </h3>
                    <p className="text-base text-gray-600 transition-all duration-300">
                        {loadingSteps[currentStep].text}
                    </p>
                </div>

                {/* 进度条 */}
                <div className="relative">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#FF8C00] to-[#cc7000] rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                            <div className="h-full w-full bg-white/30 animate-shimmer"></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 text-center mt-3">
                        {Math.min(progress, 100).toFixed(1)}%
                    </p>
                </div>

                {/* 装饰性元素 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-transparent rounded-full blur-3xl opacity-50 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-200 to-transparent rounded-full blur-3xl opacity-50 -z-10"></div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
