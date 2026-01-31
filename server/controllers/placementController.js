// 家具置换功能控制器
const dimensionsService = require('../services/dimensionsService');
const environmentService = require('../services/environmentService');
const { generatePlacementOptions } = require('../services/placementService');
const { searchFurniture } = require('../models/db');
const { cleanupTempFile } = require('../services/aiService');

/**
 * 生成家具置换方案
 * POST /api/v1/placement/generate
 */
async function generatePlacement(ctx) {
    const files = ctx.request.files;
    const fields = ctx.request.body.fields || ctx.request.body;
    let allFilePaths = [];

    try {
        // 1. 验证输入
        const photos = files.photos;
        if (!Array.isArray(photos) || photos.length < 2) {
            ctx.status = 400;
            return ctx.body = { success: false, message: "需要至少2张照片" };
        }
        allFilePaths = photos.map(p => p.filepath);

        // 2. 解析输入数据
        let inputData;
        try {
            inputData = JSON.parse(fields.inputData);
        } catch (e) {
            ctx.status = 400;
            return ctx.body = { success: false, message: "输入数据格式错误" };
        }

        const mainPhoto = photos[0];

        console.log('=== 家具置换流程开始 ===');
        console.log('家具信息:', inputData.furnitureInfo);
        console.log('用户偏好:', inputData.preferences);

        // 3. 尺寸测量（复用 dimensionsService）
        console.log('步骤 1/4: 测量家具尺寸...');
        const dimensionsResult = await dimensionsService.getCalculatedDimensions(
            photos,
            inputData.referenceObject,
            [{
                name: inputData.furnitureInfo.name,
                description: inputData.furnitureInfo.description || ''
            }]
        );
        const calculatedDimensions = dimensionsResult.calculated_dimensions[0];
        console.log('尺寸测量完成:', calculatedDimensions);

        // 4. 环境分析（复用 environmentService）
        console.log('步骤 2/4: 分析房间环境...');
        const environmentResult = await environmentService.analyzeRoomEnvironment(mainPhoto);
        console.log('环境分析完成:', environmentResult);

        // 5. 生成2套置换方案（调用 placementService）
        console.log('步骤 3/4: 生成置换方案...');
        const placementOptions = await generatePlacementOptions({
            furnitureInfo: inputData.furnitureInfo,
            dimensions: calculatedDimensions,
            environment: environmentResult,
            preferences: inputData.preferences,
            photo: mainPhoto  // 传递原始照片用于图像编辑
        });
        console.log(`生成了 ${placementOptions.options.length} 套方案`);

        // 6. 为每套方案的每件家具搜索推荐商品
        console.log('步骤 4/4: 搜索推荐商品...');
        for (let option of placementOptions.options) {
            console.log(`\n方案 ${option.id}: ${option.name}`);
            for (let furniture of option.furnitureList) {
                // 合并风格关键词和材质标签进行搜索
                const allKeywords = [
                    ...(furniture.styleKeywords || []),
                    ...(furniture.materialTags || [])
                ];

                // 打印搜索参数（为后续接入电商 API 做准备）
                console.log(`  搜索 ${furniture.name}:`);
                console.log(`    - 类别: ${furniture.name}`);
                console.log(`    - 关键词: [${allKeywords.join(', ')}]`);
                console.log(`    - 尺寸: ${furniture.estimatedDimensions.length}×${furniture.estimatedDimensions.width}×${furniture.estimatedDimensions.height} cm`);
                console.log(`    - 容差: 20%`);

                const products = searchFurniture({
                    category: furniture.name,
                    dimensions: furniture.estimatedDimensions,
                    styleKeywords: allKeywords,
                    tolerance: 0.2
                });

                furniture.recommendedProducts = products.slice(0, 5);  // 最多5个推荐
                console.log(`    ✓ 找到 ${furniture.recommendedProducts.length} 个推荐商品`);
            }
        }

        console.log('=== 家具置换流程完成 ===');

        // 7. 返回结果
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: {
                dimensions: calculatedDimensions,
                environment: environmentResult,
                options: placementOptions.options
            }
        };

    } catch (error) {
        console.error('家具置换流程失败:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: error.message || '置换方案生成失败'
        };
    } finally {
        // 清理临时文件
        console.log('清理临时文件...');
        allFilePaths.forEach(p => cleanupTempFile(p));
    }
}

/**
 * 步骤1：测量家具尺寸（独立端点）
 */
async function measureDimensions(ctx) {
    const allFilePaths = [];

    try {
        console.log('\n=== 步骤 1: 测量家具尺寸 ===');

        // 1. 解析上传的照片
        const files = ctx.request.files;
        if (!files || !files.photos) {
            ctx.status = 400;
            ctx.body = { success: false, message: '请上传照片' };
            return;
        }

        const photos = Array.isArray(files.photos) ? files.photos : [files.photos];
        if (photos.length < 2) {
            ctx.status = 400;
            ctx.body = { success: false, message: '至少需要2张照片' };
            return;
        }

        photos.forEach(p => allFilePaths.push(p.filepath));
        const mainPhoto = photos[0];

        // 2. 解析输入数据
        const inputData = JSON.parse(ctx.request.body.inputData);
        console.log('家具信息:', inputData.furnitureInfo);
        console.log('参考物:', inputData.referenceObject);

        // 3. 尺寸测量
        console.log('开始测量家具尺寸...');
        const dimensionsResult = await dimensionsService.getCalculatedDimensions(
            photos,
            inputData.referenceObject,
            [{
                name: inputData.furnitureInfo.name,
                description: inputData.furnitureInfo.description || ''
            }]
        );
        const calculatedDimensions = dimensionsResult.calculated_dimensions[0];
        console.log('尺寸测量完成:', calculatedDimensions);

        // 4. 返回尺寸结果
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: {
                dimensions: calculatedDimensions
            }
        };

    } catch (error) {
        console.error('尺寸测量失败:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: error.message || '尺寸测量失败'
        };
    } finally {
        // 清理临时文件
        console.log('清理临时文件...');
        allFilePaths.forEach(p => cleanupTempFile(p));
    }
}

module.exports = {
    generatePlacement,
    measureDimensions
};
