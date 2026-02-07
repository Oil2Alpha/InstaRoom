// Vercel Serverless Function - API 入口
const path = require('path');

// 设置环境变量（Vercel 会自动注入）
if (!process.env.GEMINI_API_KEY) {
    require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
}

const Koa = require('koa');
const Router = require('koa-router');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');

// 导入控制器 - 使用相对路径
const scoringController = require('../server/controllers/scoringController');
const furnitureController = require('../server/controllers/furnitureController');
const placementController = require('../server/controllers/placementController');
const dreamHomeController = require('../server/controllers/dreamHomeController');
const roomCustomizationController = require('../server/controllers/roomCustomizationController');

// 创建 Koa 应用
const app = new Koa();

// CORS 配置
app.use(cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization']
}));

// Body 解析中间件
app.use(koaBody({
    multipart: true,
    json: true,
    jsonLimit: '50mb',
    textLimit: '50mb',
    formLimit: '50mb',
    formidable: {
        maxFileSize: 10 * 1024 * 1024,
        keepExtensions: true,
        uploadDir: '/tmp'  // Vercel serverless 使用 /tmp
    }
}));

// 路由配置
const router = new Router({ prefix: '/api/v1' });

// 评分路由
router.post('/score', scoringController.getScore);

// 家具相关路由
router.post('/analyze/dimensions', furnitureController.testDimensions);
router.post('/process_furniture', furnitureController.processFurniture);
router.post('/analyze/environment', furnitureController.testEnvironment);

// 家具置换路由
router.post('/placement/measure', placementController.measureDimensions);
router.post('/placement/generate', placementController.generatePlacement);

// 梦中情家路由
router.post('/dream-home/generate', dreamHomeController.generateDreamHome);

// 房间定制路由
router.post('/room-customization/generate', roomCustomizationController.generateCustomization);

app.use(router.routes()).use(router.allowedMethods());

// 导出 Vercel handler
module.exports = app.callback();
