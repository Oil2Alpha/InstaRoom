// src/pages/DebugScore.jsx
// 临时调试页面，用于测试 localStorage 和数据流

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DebugScore = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);

    const addLog = (message) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const testLocalStorage = () => {
        addLog('开始测试 localStorage...');

        // 测试写入
        const testData = {
            total_score: 88,
            scores: {
                Functional_Score: 85,
                Aesthetics_Score: 88,
                Lighting_Score: 90,
                Overall_Design_Score: 87
            },
            inherent_style: "Modern Minimalist",
            summary_text: "测试数据",
            improvement_suggestions: ["建议1", "建议2"],
            key_suggestion_category: "Test"
        };

        try {
            localStorage.setItem('scoringResult', JSON.stringify(testData));
            addLog('✅ 写入成功');

            const stored = localStorage.getItem('scoringResult');
            if (stored) {
                addLog(`✅ 读取成功，数据长度: ${stored.length}`);
                const parsed = JSON.parse(stored);
                addLog(`✅ 解析成功，总分: ${parsed.total_score}`);
            } else {
                addLog('❌ 读取失败');
            }
        } catch (error) {
            addLog(`❌ 错误: ${error.message}`);
        }
    };

    const checkLocalStorage = () => {
        addLog('检查 localStorage 当前状态...');
        const data = localStorage.getItem('scoringResult');
        if (data) {
            addLog(`✅ 找到数据，长度: ${data.length}`);
            try {
                const parsed = JSON.parse(data);
                addLog(`✅ 数据有效，总分: ${parsed.total_score}`);
            } catch (e) {
                addLog(`❌ 数据损坏: ${e.message}`);
            }
        } else {
            addLog('❌ 未找到数据');
        }
    };

    const clearLocalStorage = () => {
        localStorage.removeItem('scoringResult');
        addLog('🗑️ 已清除 localStorage');
    };

    const goToResult = () => {
        addLog('跳转到 ScoreResult 页面...');
        navigate('/score/result');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">评分功能调试工具</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">测试操作</h2>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={testLocalStorage}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            测试 localStorage 写入/读取
                        </button>
                        <button
                            onClick={checkLocalStorage}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            检查当前数据
                        </button>
                        <button
                            onClick={clearLocalStorage}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            清除数据
                        </button>
                        <button
                            onClick={goToResult}
                            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                            跳转到结果页
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            返回主页
                        </button>
                    </div>
                </div>

                <div className="bg-gray-900 text-green-400 rounded-lg shadow p-6 font-mono text-sm">
                    <h2 className="text-white text-xl font-semibold mb-4">调试日志</h2>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500">暂无日志...</p>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index}>{log}</div>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">使用说明</h3>
                    <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                        <li>点击"测试 localStorage"验证浏览器存储功能</li>
                        <li>点击"检查当前数据"查看是否有遗留数据</li>
                        <li>点击"跳转到结果页"测试页面跳转</li>
                        <li>如果结果页报错，返回此页面查看日志</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default DebugScore;
