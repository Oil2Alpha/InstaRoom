// routes/api.js

const Router = require('koa-router');
const scoringController = require('../controllers/scoringController');
const furnitureController = require('../controllers/furnitureController');
const placementController = require('../controllers/placementController');
const dreamHomeController = require('../controllers/dreamHomeController');
const roomCustomizationController = require('../controllers/roomCustomizationController');

const apiRouter = new Router({ prefix: '/api/v1' });

// 评分与建议功能路由
apiRouter.post('/score', scoringController.getScore);

// 家具尺寸计算与替换
apiRouter.post('/analyze/dimensions', furnitureController.testDimensions);  //测试用
apiRouter.post('/process_furniture', furnitureController.processFurniture);

// 环境分析测试路由 (新增) === 仅用于测试，上线不要部署
apiRouter.post('/analyze/environment', furnitureController.testEnvironment);

// 家具置换路由
apiRouter.post('/placement/measure', placementController.measureDimensions);  // 步骤1：测量尺寸
apiRouter.post('/placement/generate', placementController.generatePlacement);  // 完整流程

// 梦中情家路由
apiRouter.post('/dream-home/generate', dreamHomeController.generateDreamHome);

// 房间定制路由
apiRouter.post('/room-customization/generate', roomCustomizationController.generateCustomization);

module.exports = apiRouter;