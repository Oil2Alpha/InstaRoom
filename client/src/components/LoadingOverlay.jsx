// src/components/LoadingOverlay.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LoadingOverlay = ({
    isLoading,
    message,  // 自定义消息
    progress: externalProgress,  // 外部控制的进度（0-100）
    duration = 7000,  // 默认持续时间（毫秒）
    type = 'auto'  // 'placement', 'scoring', 或 'auto'（根据 message 自动判断）
}) => {
    const { t, i18n } = useTranslation('common');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    // 从翻译文件获取加载步骤
    const placementSteps = t('loadingSteps.placement', { returnObjects: true }) || [];
    const scoringSteps = t('loadingSteps.scoring', { returnObjects: true }) || [];

    // 根据 type 或 message 判断使用哪组步骤
    const getLoadingSteps = () => {
        if (type === 'placement') return placementSteps;
        if (type === 'scoring') return scoringSteps;

        // auto 模式：根据消息内容判断
        if (message) {
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('置换') || lowerMessage.includes('家具') ||
                lowerMessage.includes('尺寸') || lowerMessage.includes('furniture') ||
                lowerMessage.includes('swap') || lowerMessage.includes('dimension')) {
                return placementSteps;
            }
        }
        return scoringSteps;
    };

    const loadingSteps = getLoadingSteps();

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
            setCurrentStep(prev => (prev + 1) % (loadingSteps.length || 1));
        }, 1000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
        };
    }, [isLoading, externalProgress, duration, loadingSteps.length]);

    if (!isLoading) return null;

    // 安全获取当前步骤
    const currentStepData = loadingSteps[currentStep] || { icon: '⏳', text: t('loading') };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md animate-fadeIn">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full mx-4 border border-white/50">
                {/* 图标和文字 */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 animate-bounce">
                        {currentStepData.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {message || t('defaultLoadingMessage')}
                    </h3>
                    <p className="text-base text-gray-600 transition-all duration-300">
                        {currentStepData.text}
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
