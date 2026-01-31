// 家具置换方案生成服务
const { ai } = require('./aiService');
const { generatePlacementPrompt } = require('../config/prompts');

/**
 * 生成家具置换方案
 * @param {object} params - 参数对象
 * @param {object} params.furnitureInfo - 家具信息
 * @param {object} params.dimensions - 尺寸测量结果
 * @param {object} params.environment - 环境分析结果
 * @param {object} params.preferences - 用户偏好
 * @param {object} params.photo - 原始照片（用于图像编辑）
 * @returns {object} 包含 2 套方案的 JSON
 */
async function generatePlacementOptions({ furnitureInfo, dimensions, environment, preferences, photo }) {
    try {
        // 构建 prompt 输入
        const promptInput = {
            furnitureInfo,
            dimensions,
            environment,
            preferences
        };

        // 生成 prompt（传递完整的参数对象）
        const prompt = generatePlacementPrompt(promptInput);

        console.log('Generating placement options with Gemini...');

        // 调用 Gemini 生成方案
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ text: prompt }],
            config: {
                responseMimeType: "application/json",
                temperature: 0.7  // 提高创造性
            }
        });

        const resultJson = JSON.parse(response.text.trim());

        // 为每个方案生成效果图（基于原图进行家具置换）
        console.log('Generating effect images for each option...');
        for (let option of resultJson.options) {
            if (option.imagePrompt && photo) {
                console.log(`\n=== 方案 ${option.id}: ${option.name} ===`);
                console.log('完整 imagePrompt:');
                console.log(option.imagePrompt);
                console.log('===================================\n');

                option.renderedImage = await generatePlacementImage(option.imagePrompt, photo);
            }
        }

        return resultJson;

    } catch (error) {
        console.error("Error generating placement options:", error);
        throw error;
    }
}

/**
 * 使用 Gemini 2.5 Flash Image 生成效果图（基于原图进行家具置换）
 * @param {string} imagePrompt - 图像编辑 prompt
 * @param {object} photo - 原始照片对象 {filepath, mimetype}
 * @returns {string} base64 编码的图片，或 null（如果失败）
 */
async function generatePlacementImage(imagePrompt, photo) {
    try {
        console.log('Calling Gemini 2.5 Flash Image API for image editing...');
        console.log('Prompt:', imagePrompt.substring(0, 100) + '...');

        // 导入 fileToGenerativePart 函数
        const { fileToGenerativePart } = require('./aiService');

        // 将照片转换为 Gemini API 格式
        const imagePart = fileToGenerativePart(photo.filepath, photo.mimetype);

        // 使用 Gemini 2.5 Flash Image 模型进行图像编辑
        // 传递原始图片和编辑指令
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: [
                imagePart,  // 原始照片
                { text: imagePrompt }  // 编辑指令
            ]
        });

        // 从响应中提取图像数据
        if (response.candidates && response.candidates.length > 0) {
            const parts = response.candidates[0].content.parts;

            for (const part of parts) {
                if (part.inlineData) {
                    // 找到图像数据
                    const imageData = part.inlineData.data;
                    console.log('Image edited successfully, size:', imageData.length);
                    return imageData; // 直接返回 base64 字符串
                }
            }
        }

        console.warn('No image data found in response');
        return null;

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        // 如果图像生成失败，返回 null，前端显示占位符
        return null;
    }
}

module.exports = {
    generatePlacementOptions,
    generatePlacementImage
};
