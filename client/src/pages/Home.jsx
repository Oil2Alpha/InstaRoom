// src/pages/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';
import scoringIcon from '../assets/images/scoring_icon.png';
import furnitureSwapIcon from '../assets/images/furniture_swap_icon.png';
import wholeHomeIcon from '../assets/images/whole_home_icon.png';

const Home = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('home');

    const features = [
        {
            id: 1,
            title: t('features.roomScoring.title'),
            subtitle: 'AI ' + t('analyze'),
            description: t('features.roomScoring.description'),
            icon: scoringIcon,
            route: '/score/input',
            color: 'from-orange-400 to-orange-600',
            available: true,
            cta: t('features.roomScoring.cta')
        },
        {
            id: 2,
            title: t('features.furnitureSwap.title'),
            subtitle: t('features.furnitureSwap.subtitle', { defaultValue: '智能推荐方案' }),
            description: t('features.furnitureSwap.description'),
            icon: furnitureSwapIcon,
            route: '/placement/input',
            color: 'from-amber-400 to-orange-500',
            available: true,
            cta: t('features.furnitureSwap.cta')
        },
        {
            id: 3,
            title: t('features.roomCustomization.title'),
            subtitle: t('features.roomCustomization.subtitle', { defaultValue: '风格定制方案' }),
            description: t('features.roomCustomization.description'),
            icon: wholeHomeIcon,
            route: '/room-customization/input',
            color: 'from-yellow-400 to-amber-500',
            available: true,
            cta: t('features.roomCustomization.cta')
        }
    ];

    const handleFeatureClick = (feature) => {
        if (feature.available) {
            navigate(feature.route);
        } else {
            alert(t('common:featureComingSoon', { defaultValue: '该功能正在开发中，敬请期待！' }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300 rounded-full blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 px-4 pt-8 pb-12">
                    <Logo />

                    {/* Hero Text */}
                    <div className="max-w-2xl mx-auto text-center mt-12 mb-16">
                        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            {t('welcome')}
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto">
                            {t('subtitle')}
                            <br />
                            <span className="text-[#FF8C00] font-medium">{t('description')}</span>
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                onClick={() => handleFeatureClick(feature)}
                                className={`
                                    group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl 
                                    transition-all duration-500 ease-out cursor-pointer overflow-hidden
                                    ${feature.available ? 'hover:scale-105' : 'opacity-75'}
                                `}
                                style={{
                                    animationDelay: `${index * 150}ms`,
                                    animation: 'fadeInUp 0.8s ease-out forwards'
                                }}
                            >
                                {/* Gradient Overlay on Hover */}
                                <div className={`
                                    absolute inset-0 bg-gradient-to-br ${feature.color} 
                                    opacity-0 group-hover:opacity-10 transition-opacity duration-500
                                `}></div>

                                {/* Card Content */}
                                <div className="relative p-8">
                                    {/* Icon */}
                                    <div className="mb-6 flex justify-center">
                                        <div className="relative">
                                            <div className={`
                                                absolute inset-0 bg-gradient-to-br ${feature.color} 
                                                rounded-full blur-xl opacity-30 group-hover:opacity-50 
                                                transition-opacity duration-500
                                            `}></div>
                                            <img
                                                src={feature.icon}
                                                alt={feature.title}
                                                className="relative w-20 h-20 object-contain transform group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-3 font-medium">
                                            {feature.subtitle}
                                        </p>
                                        <p className="text-gray-600 leading-relaxed mb-6 min-h-[60px]">
                                            {feature.description}
                                        </p>

                                        {/* CTA Button */}
                                        <button
                                            className={`
                                                w-full py-3 px-6 rounded-xl font-semibold text-white
                                                bg-gradient-to-r ${feature.color}
                                                transform group-hover:scale-105 transition-all duration-300
                                                shadow-md group-hover:shadow-xl
                                                ${!feature.available && 'opacity-50 cursor-not-allowed'}
                                            `}
                                            disabled={!feature.available}
                                        >
                                            {feature.cta}
                                        </button>
                                    </div>
                                </div>

                                {/* Coming Soon Badge */}
                                {!feature.available && (
                                    <div className="absolute top-4 right-4 bg-gray-900 text-white text-xs px-3 py-1 rounded-full">
                                        {t('common:comingSoon', { defaultValue: '即将推出' })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 py-8 text-center text-gray-500 text-sm">
                <p>{t('footer.copyright')}</p>
                <p className="mt-2">{t('footer.madeWith')}</p>
            </footer>

            {/* Animations */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
