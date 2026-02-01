// controllers/roomCustomizationController.js

const roomCustomizationService = require('../services/roomCustomizationService');
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
 * 生成房间定制方案
 */
async function generateCustomization(ctx) {
    const allFilePaths = [];

    try {
        console.log('\n=== 房间定制请求 ===');

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

        // 2. 解析用户需求
        const requirementsStr = ctx.request.body.userRequirements;
        if (!requirementsStr) {
            ctx.status = 400;
            ctx.body = { success: false, message: '缺少用户需求数据' };
            return;
        }

        const userRequirements = JSON.parse(requirementsStr);
        console.log('房间用途:', userRequirements.room_purpose);
        console.log('风格偏好:', userRequirements.style_preferences);
        console.log('预算:', userRequirements.budget_range);

        // 2.5 提取语言参数（默认英文，适合 Hackathon）
        const language = ctx.request.body.language || 'en';
        console.log('语言:', language);

        // 3. 调用服务生成定制方案（传入语言参数）
        const result = await roomCustomizationService.generateCustomizationPlan(
            photo,
            userRequirements,
            language
        );

        console.log('=== 房间定制方案生成完成 ===');

        // 4. 返回结果
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: {
                room_analysis: result.room_analysis,
                design_plan: result.design_plan,
                rendered_image: result.rendered_image,
                shopping_list: result.shopping_list,
                total_cost: result.total_cost
            }
        };

    } catch (error) {
        console.error('房间定制生成失败:', error);
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
    generateCustomization
};
