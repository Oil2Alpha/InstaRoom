// controllers/scoringController.js

const scoringService = require('../services/scoringService');

/**
 * 处理 POST /api/v1/score 请求
 * 接收一张房间照片，调用 AI 服务进行打分和建议生成
 */
async function getScore(ctx) {
    // 1. 从 ctx.request 中提取数据
    // 注意：koa-body 在 multipart 模式下将文件放在 ctx.request.files 中
    const files = ctx.request.files;
    const fields = ctx.request.body.fields; // 其他表单字段（如果有）

    //临时调试
    // console.log('Received Files Object:', files);
    // console.log('Received Body Fields:', ctx.request.body.fields); 
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    let photo = null;
    
    // 检查 files 对象中是否包含名为 'photo' 的字段
    // if (files && files.photo) {
    //     photo = files.photo; 
    // } 

    //let photo = null;

    // 检查文件上传
    if (files && files.photo) {
        // 如果只上传了一张照片，files.photo 会是一个对象
        photo = files.photo;
    } else if (files && Array.isArray(files.photo) && files.photo.length > 0) {
        // 如果上传了多张照片，取第一张（评分功能只需要一张）
        photo = files.photo[0];
    }

    if (!photo) {
        ctx.status = 400;
        ctx.body = { success: false, message: "请上传一张房间照片进行评分。" };
        return;
    }
    
    // 可选：提取用户关注点 (focusArea)
    const focusArea = fields ? fields.focusArea : null;

    try {
        // 2. 调用核心服务逻辑
        const scoreResult = await scoringService.getHomeScore(photo, focusArea);

        // 3. 返回成功响应
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: scoreResult
        };

    } catch (error) {
        // 4. 处理错误，并返回用户友好的错误信息
        console.error("Scoring API Error:", error.message);
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: "评分失败，请稍后再试或检查上传的照片。",
            details: error.message
        };
    }
}

module.exports = {
    getScore
};