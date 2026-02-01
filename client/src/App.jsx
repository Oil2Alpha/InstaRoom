// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LanguageSwitcher from './i18n/LanguageSwitcher';

// 导入页面组件
import Home from './pages/Home';
import ScoreInput from './pages/ScoreInput';
import ScoreResult from './pages/ScoreResult';
import PlacementInput from './pages/PlacementInput';
import PlacementResult from './pages/PlacementResult';
import DreamHomeResult from './pages/DreamHomeResult';
import RoomCustomizationInput from './pages/RoomCustomizationInput';
import RoomCustomizationResult from './pages/RoomCustomizationResult';
import DebugScore from './pages/DebugScore';

const App = () => {
  return (
    <>
      {/* 全局语言切换器 */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
        <LanguageSwitcher />
      </div>

      <Routes>
        {/* 主页 */}
        <Route path="/" element={<Home />} />

        {/* 评分功能路由 */}
        <Route path="/score/input" element={<ScoreInput />} />
        <Route path="/score/result" element={<ScoreResult />} />

        {/* 家具置换功能路由 */}
        <Route path="/placement/input" element={<PlacementInput />} />
        <Route path="/placement/result" element={<PlacementResult />} />

        {/* 梦中情家功能路由 */}
        <Route path="/dream-home/result" element={<DreamHomeResult />} />

        {/* 房间定制功能路由 */}
        <Route path="/room-customization/input" element={<RoomCustomizationInput />} />
        <Route path="/room-customization/result" element={<RoomCustomizationResult />} />

        {/* 调试工具 */}
        <Route path="/debug" element={<DebugScore />} />

        {/* 404 页面 */}
        <Route path="*" element={<div className="text-center p-8">404 - 页面未找到</div>} />
      </Routes>
    </>
  );
};

export default App;