// services/dreamHomeService.js

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({});

/**
 * 基于评分优化点生成梦中情家
 * @param {object} photo - 原始照片对象 {filepath, mimetype}
 * @param {object} scoreData - 评分数据
 * @returns {object} { renderedImage, shoppingList }
 */
async function generateDreamHome(photo, scoreData) {
    try {
        console.log('\n=== 开始生成梦中情家 ===');
        console.log('评分:', scoreData.score);
        console.log('优化建议数量:', scoreData.suggestions?.length || 0);

        // 步骤1：分析优化点并生成改造描述
        const improvementPrompt = await generateImprovementPrompt(scoreData);
        console.log('改造描述生成完成');

        // 步骤2：生成购物清单
        const shoppingList = await generateShoppingList(scoreData);
        console.log('购物清单生成完成，商品数量:', shoppingList.length);

        // 步骤3：生成渲染图
        const renderedImage = await generateRenderedImage(photo, improvementPrompt);
        console.log('渲染图生成完成');

        return {
            renderedImage,
            shoppingList
        };

    } catch (error) {
        console.error('生成梦中情家失败:', error);
        throw error;
    }
}

/**
 * 生成改造描述 prompt（使用新 Prompt 系统）
 */
async function generateImprovementPrompt(scoreData) {
    const { DreamHomeBuilder } = require('../prompts');

    const builder = DreamHomeBuilder.createImprovementBuilder();
    const prompt = await builder
        .setScoreData(scoreData)
        .build();

    console.log('使用新 Prompt 系统生成改造指令');
    return prompt;
}

/**
 * 生成购物清单（使用新 Prompt 系统）
 */
async function generateShoppingList(scoreData) {
    try {
        const { suggestions } = scoreData;

        if (!suggestions || suggestions.length === 0) {
            return [];
        }

        const { DreamHomeBuilder } = require('../prompts');

        const builder = DreamHomeBuilder.createShoppingListBuilder();
        const prompt = await builder
            .setSuggestions(suggestions)
            .addRelevantExamples(suggestions, 2)
            .build();

        console.log('使用新 Prompt 系统生成购物清单 Prompt');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        const text = response.text.trim();

        // 提取 JSON
        let jsonText = text;
        if (text.includes('```json')) {
            jsonText = text.split('```json')[1].split('```')[0].trim();
        } else if (text.includes('```')) {
            jsonText = text.split('```')[1].split('```')[0].trim();
        }

        const result = JSON.parse(jsonText);
        return result.items || [];

    } catch (error) {
        console.error('生成购物清单失败:', error);
        // 返回空列表而不是抛出错误
        return [];
    }
}

/**
 * 生成渲染图
 */
async function generateRenderedImage(photo, improvementPrompt) {
    try {
        console.log('调用 Gemini 2.5 Flash Image 生成渲染图...');

        // 导入 fileToGenerativePart 函数
        const { fileToGenerativePart } = require('./aiService');

        // 将照片转换为 Gemini API 格式
        const imagePart = fileToGenerativePart(photo.filepath, photo.mimetype);

        // 使用 Gemini 2.5 Flash Image 模型进行图像编辑
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: [
                imagePart,  // 原始照片
                { text: improvementPrompt }  // 改造指令
            ]
        });

        // 从响应中提取图像数据
        if (response.candidates && response.candidates.length > 0) {
            const parts = response.candidates[0].content.parts;

            for (const part of parts) {
                if (part.inlineData) {
                    const imageData = part.inlineData.data;
                    console.log('渲染图生成成功，大小:', imageData.length);
                    return imageData; // 返回 base64 字符串
                }
            }
        }

        console.warn('未找到图像数据');
        return null;

    } catch (error) {
        console.error('生成渲染图失败:', error);
        return null;
    }
}

module.exports = {
    generateDreamHome
};
