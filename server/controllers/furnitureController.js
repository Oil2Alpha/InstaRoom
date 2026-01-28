// 用于接受前端数据并处理以实现尺寸校准

const dimensionsService = require('../services/dimensionsService');

//此接口用于测试
const environmentService = require('../services/environmentService');

const renderingService = require('../services/renderingService'); // 引入渲染服务
const furnitureModel = require('../models/furnitureModel'); // 引入数据库模型
const { cleanupTempFile } = require('../services/aiService'); // 引入清理函数

/**
 * [临时测试函数] 仅用于测试尺寸校准 API
 * POST /api/v1/analyze/dimensions
 */
async function testDimensions(ctx) {
    // Koa-body 将多文件放在 files 数组中 (Key: photos)
    const files = ctx.request.files;
    const fields = ctx.request.body.fields || ctx.request.body;

    // 假设前端发送的字段名：
    // files.photos: 2-3 张图片数组
    // fields.referenceObject: 'Coke_Can'
    // fields.furnitureDetails: JSON 字符串 [ {name: "桌子", description: "靠近墙角"} ]

    const photos = files.photos;
    
    // 确保 photos 是数组，且至少有两个文件
    if (!Array.isArray(photos) || photos.length < 2) {
        ctx.status = 400;
        ctx.body = { success: false, message: "尺寸校准需要至少 2 张照片。" };
        return;
    }
    
    try {
        const referenceObject = fields.referenceObject;
        // 注意：前端传来的 JSON 字符串需要解析
        const furnitureDescriptions = JSON.parse(fields.furnitureDetails); 

        const dimensionsResult = await dimensionsService.getCalculatedDimensions(
            photos, 
            referenceObject, 
            furnitureDescriptions
        );

        ctx.status = 200;
        ctx.body = {
            success: true,
            message: "尺寸计算成功",
            data: dimensionsResult
        };

    } catch (error) {
        console.error('Dimensions API Error:', error);
        ctx.status = error.status || 500;
        ctx.body = { 
            success: false, 
            message: "尺寸计算失败。",
            details: error.message
        };
    }
}

// 核心主流程 (待实现)
async function processFurniture(ctx) {
    // ... 
}

/**
 * [临时测试函数] 仅用于测试环境分析 API
 * POST /api/v1/analyze/environment
 */
async function testEnvironment(ctx) {
    const files = ctx.request.files;
    let photo = files.photo; // 假设前端 Key 还是 photo

    if (!photo) {
        ctx.status = 400;
        ctx.body = { success: false, message: "请上传一张照片进行环境分析。" };
        return;
    }

    // 如果是多张，取第一张进行分析
    if (Array.isArray(photo)) {
        photo = photo[0];
    }

    try {
        const environmentResult = await environmentService.analyzeRoomEnvironment(photo);

        ctx.status = 200;
        ctx.body = {
            success: true,
            message: "环境分析成功",
            data: environmentResult
        };

    } catch (error) {
        console.error('Environment API Error:', error);
        ctx.status = error.status || 500;
        ctx.body = { 
            success: false, 
            message: "环境分析失败。",
            details: error.message
        };
    }
}

/**
 * [核心功能] 单家具置换主流程
 * POST /api/v1/process_furniture
 */
async function processFurniture(ctx) {
    const files = ctx.request.files;
    const fields = ctx.request.body.fields || ctx.request.body;
    let allFilePaths = []; 
    // --- 1. 验证和提取前端输入 ---
    const photos = files.photos;
    allFilePaths = photos.map(p => p.filepath); 
    if (!Array.isArray(photos) || photos.length < 2) {
        ctx.status = 400;
        return ctx.body = { success: false, message: "置换方案需要至少 2 张照片和必要的输入字段。" };
    }
    
    // 提取结构化数据 (需要前端发送 JSON 字符串)
    let inputData;
    try {
        inputData = JSON.parse(fields.inputData); 
    } catch (e) {
        ctx.status = 400;
        return ctx.body = { success: false, message: "输入数据格式错误，需要合法的 JSON。" };
    }
    
    // 假设第一个文件是最佳主视图，用于环境分析和渲染
    const mainPhoto = Array.isArray(photos) ? photos[0] : photos; 
    
    // 假设要替换的家具只有一个 (MVP 简化处理)
    const targetFurniture = inputData.replacementItems[0]; 

    const finalResults = [];
    
    try {
        // --- 2. AI 智能分析：尺寸和环境 ---
        
        // 2a. 尺寸计算
        const dimensionsResult = await dimensionsService.getCalculatedDimensions(
            photos, 
            inputData.referenceObject, 
            [targetFurniture] // 只传递第一个目标家具
        );
        const calculatedDimensions = dimensionsResult.calculated_dimensions[0]; // 取第一个家具的计算结果

        // 2b. 环境分析 (风格和光照)
        const environmentResult = await environmentService.analyzeRoomEnvironment(mainPhoto);

        // --- 3. 数据库智能筛选 ---

        // 整理筛选要求
        const requirements = {
            targetDimensions: calculatedDimensions,
            environmentStyle: environmentResult.inherent_style,
            userBudget: inputData.userPreferences.Total_Budget,
            usedWeight: inputData.userPreferences.Used_Weight,
            userTags: inputData.userPreferences.Feature_Tags
        };
        
        const candidateItems = furnitureModel.filterFurniture(requirements);
        
        if (candidateItems.length === 0) {
            ctx.status = 200;
            return ctx.body = { success: true, message: "未找到符合所有条件的商品。", data: [] };
        }

        // --- 4. 实时渲染与评分决策 (循环) ---
        
        // 注意：这里需要确保 renderingService 能处理 mainPhoto（主视图）
        for (const item of candidateItems) {
            const renderData = await renderingService.renderAndScore(
                mainPhoto, 
                item, 
                environmentResult, 
                targetFurniture.Bbox // 传入圈选区域坐标
            );
            finalResults.push(renderData);
        }

        // 5. 最终排序和返回 (按 AI 融入度评分排序)
        finalResults.sort((a, b) => b.ai_integration_score - a.ai_integration_score);

        ctx.status = 200;
        ctx.body = {
            success: true,
            message: "单家具置换方案生成成功。",
            data: finalResults
        };

    } catch (error) {
        console.error('Core Furniture Process Failed:', error);
        ctx.status = error.status || 500;
        ctx.body = { 
            success: false, 
            message: "核心置换流程在AI或数据库步骤中失败。",
            details: error.message
        };
    } finally {
        // === 最终清理：确保无论成功或失败，临时文件都被清理 ===
        console.log("Cleaning up temporary files...");
        allFilePaths.forEach(p => cleanupTempFile(p));
    }
}

// ... (导出 processFurniture, testDimensions, testEnvironment)

module.exports = {
    testDimensions,
    testEnvironment,
    processFurniture
};