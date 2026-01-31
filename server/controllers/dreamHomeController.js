// controllers/dreamHomeController.js

const dreamHomeService = require('../services/dreamHomeService');
const path = require('path');
const fs = require('fs');

/**
 * 清理临时文件
 */
function cleanupTempFile(filepath) {
    try {
        if (filepath && fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log('已清理临时文件:', filepath);
        }
    } catch (err) {
        console.error('清理文件失败:', err);
    }
}

/**
 * 生成梦中情家
 */
async function generateDreamHome(ctx) {
    const allFilePaths = [];

    try {
        console.log('\n=== 梦中情家生成请求 ===');

        // 1. 解析上传的照片
        const files = ctx.request.files;
        if (!files || !files.photo) {
            ctx.status = 400;
            ctx.body = { success: false, message: '请上传照片' };
            return;
        }

        const photo = files.photo;
        allFilePaths.push(photo.filepath);

        console.log('收到照片:', photo.originalFilename);

        // 2. 解析评分数据
        const scoreDataStr = ctx.request.body.scoreData;
        if (!scoreDataStr) {
            ctx.status = 400;
            ctx.body = { success: false, message: '缺少评分数据' };
            return;
        }

        const scoreData = JSON.parse(scoreDataStr);

        // 适配字段名（评分数据使用 total_score 和 improvement_suggestions）
        const score = scoreData.score || scoreData.total_score;
        const suggestions = scoreData.suggestions || scoreData.improvement_suggestions;

        console.log('评分:', score);
        console.log('优化建议数量:', suggestions?.length || 0);

        // 标准化数据结构
        const normalizedScoreData = {
            ...scoreData,
            score: score,
            suggestions: suggestions
        };

        // 3. 调用服务生成梦中情家
        const result = await dreamHomeService.generateDreamHome(photo, normalizedScoreData);

        console.log('=== 梦中情家生成完成 ===');

        // 4. 返回结果
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: {
                renderedImage: result.renderedImage,
                shoppingList: result.shoppingList
            }
        };

    } catch (error) {
        console.error('梦中情家生成失败:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: error.message || '生成失败'
        };
    } finally {
        // 清理临时文件
        console.log('清理临时文件...');
        allFilePaths.forEach(p => cleanupTempFile(p));
    }
}

module.exports = {
    generateDreamHome
};
