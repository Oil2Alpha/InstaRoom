// server.js

const Koa = require('koa');
const Router = require('koa-router');
const { koaBody } = require('koa-body');
const routes = require('./routes');
const serve = require('koa-static');
const cors = require('@koa/cors'); // 导入 CORS
const path = require('path');
require('dotenv').config(); // 确保加载环境变量

// === 代理配置说明 ===
// 如果使用 Clash TUN 模式（虚拟网卡），无需配置代理，流量会自动通过虚拟网卡
// 如果使用 HTTP 代理模式，取消下面的注释并配置正确的代理地址
/*
const { setGlobalDispatcher, ProxyAgent } = require('undici');
const PROXY_URL = process.env.PROXY_URL || 'http://127.0.0.1:7897'; 
const proxyAgent = new ProxyAgent(PROXY_URL);
setGlobalDispatcher(proxyAgent);
console.log(`Using HTTP proxy: ${PROXY_URL}`);
*/
// ==========================================

const app = new Koa();
const port = process.env.PORT || 3000;
app.use(cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization']
}));

// 1. 配置文件上传中间件
app.use(koaBody({
    multipart: true, // 启用多部分表单解析
    formidable: {
        maxFileSize: 5 * 1024 * 1024, // 限制文件大小为 10MB
        uploadDir: './temp_uploads', // 临时文件存放目录
        keepExtensions: true, // 保留文件扩展名
        onFileBegin: (name, file) => {
            // 确保临时目录存在
            const fs = require('fs');
            if (!fs.existsSync('./temp_uploads')) {
                fs.mkdirSync('./temp_uploads');
            }
        }
    }
}));

// === 静态文件服务配置===
app.use(serve(path.join(__dirname, 'public')));

// 2. 路由配置
const router = new Router();
routes.init(router); // 假设 routes/index.js 负责加载所有路由
app.use(router.routes()).use(router.allowedMethods());

// 3. 错误处理（可选，但推荐）
app.on('error', (err, ctx) => {
    console.error('Server Error:', err.message);
    // 可在此处发送更详细的错误日志
});


app.listen(port, () => {
    console.log(`InstaRoom Backend running on http://localhost:${port}`);
});