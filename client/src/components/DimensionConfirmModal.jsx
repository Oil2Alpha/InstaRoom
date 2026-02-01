// src/components/DimensionConfirmModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DimensionConfirmModal = ({ isOpen, dimensions, onConfirm, onCancel }) => {
    const { t } = useTranslation('placement');
    const [editedDimensions, setEditedDimensions] = useState({
        length_cm: 0,
        width_cm: 0,
        height_cm: 0
    });

    useEffect(() => {
        if (dimensions) {
            setEditedDimensions({
                length_cm: dimensions.length_cm || 0,
                width_cm: dimensions.width_cm || 0,
                height_cm: dimensions.height_cm || 0
            });
        }
    }, [dimensions]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(editedDimensions);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
                {/* 标题 */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📏</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {t('dimensionModal.title')}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {t('dimensionModal.subtitle')}
                    </p>
                </div>

                {/* 尺寸输入 */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dimensionModal.length')}
                        </label>
                        <input
                            type="number"
                            value={editedDimensions.length_cm}
                            onChange={(e) => setEditedDimensions({
                                ...editedDimensions,
                                length_cm: parseFloat(e.target.value) || 0
                            })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-lg font-semibold text-center"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dimensionModal.width')}
                        </label>
                        <input
                            type="number"
                            value={editedDimensions.width_cm}
                            onChange={(e) => setEditedDimensions({
                                ...editedDimensions,
                                width_cm: parseFloat(e.target.value) || 0
                            })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-lg font-semibold text-center"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dimensionModal.height')}
                        </label>
                        <input
                            type="number"
                            value={editedDimensions.height_cm}
                            onChange={(e) => setEditedDimensions({
                                ...editedDimensions,
                                height_cm: parseFloat(e.target.value) || 0
                            })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-lg font-semibold text-center"
                        />
                    </div>
                </div>

                {/* 提示信息 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-xs text-blue-800">
                        {t('dimensionModal.tip')}
                    </p>
                </div>

                {/* 按钮 */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        {t('dimensionModal.cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                        {t('dimensionModal.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DimensionConfirmModal;
