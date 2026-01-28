// routes/index.js

const apiRouter = require('./api');

/**
 * 初始化所有应用路由
 * @param {KoaRouter} router - Koa 路由实例
 */
function init(router) {
    // 加载 v1 API 路由
    router.use(apiRouter.routes());
}

module.exports = { init };