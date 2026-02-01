// services/roomCustomizationService.js

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({});

// 引入多语言 Prompt 配置
const {
    getDesignPlanPrompt,
    getShoppingListPrompt,
    buildSpecialConstraints,
    getRenderImagePrompt
} = require('../config/roomCustomizationPrompts');

/**
 * 生成房间定制方案
 * @param {object} photo - 原始照片对象 {filepath, mimetype}
 * @param {object} userRequirements - 用户需求
 * @param {string} language - 语言参数 ('en' 或 'zh')
 * @returns {object} { room_analysis, design_plan, rendered_image, shopping_list, total_cost }
 */
async function generateCustomizationPlan(photo, userRequirements, language = 'en') {
    try {
        console.log('\n=== 开始生成房间定制方案 ===');
        console.log('房间用途:', userRequirements.room_purpose);
        console.log('风格偏好:', userRequirements.style_preferences);
        console.log('预算:', userRequirements.budget_range);
        console.log('语言:', language);

        // 步骤1：分析房间（传入语言参数）
        const roomAnalysis = await analyzeRoom(photo, userRequirements.room_purpose, language);
        console.log('房间分析完成');

        // 步骤2：生成设计方案（传入语言参数）
        const designPlan = await generateDesignPlan(roomAnalysis, userRequirements, language);
        console.log('设计方案生成完成');

        // 步骤3：生成购物清单（传入语言参数）
        const shoppingList = await generateShoppingList(designPlan, userRequirements, language);
        console.log('购物清单生成完成，商品数量:', shoppingList.length);

        // 步骤4：生成渲染图（传入语言参数）
        const renderedImage = await generateRenderedImage(photo, designPlan, language);
        console.log('渲染图生成完成');

        // 计算总价
        const totalCost = shoppingList.reduce((sum, item) => sum + (item.price || 0), 0);

        return {
            room_analysis: roomAnalysis,
            design_plan: designPlan,
            rendered_image: renderedImage,
            shopping_list: shoppingList,
            total_cost: totalCost
        };

    } catch (error) {
        console.error('生成定制方案失败:', error);
        throw error;
    }
}

/**
 * 分析房间（使用新的 Prompt 工程系统）
 */
async function analyzeRoom(photo, roomPurposeHint, language = 'en') {
    try {
        const { fileToGenerativePart } = require('./aiService');
        const { RoomCustomizationBuilder } = require('../prompts');

        const imagePart = fileToGenerativePart(photo.filepath, photo.mimetype);

        // 使用 Prompt Builder 构建结构化 Prompt（传入语言参数）
        const builder = new RoomCustomizationBuilder(language);
        await builder.loadTemplate();
        const prompt = await builder
            .setRoomTypeHint(roomPurposeHint)
            .addRelevantExamples(roomPurposeHint, 2)
            .build();

        console.log(`使用新 Prompt 系统生成房间分析 Prompt (语言: ${language})`);

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [imagePart, { text: prompt }]
        });

        const text = response.text.trim();

        // 提取 JSON
        let jsonText = text;
        if (text.includes('```json')) {
            jsonText = text.split('```json')[1].split('```')[0].trim();
        } else if (text.includes('```')) {
            jsonText = text.split('```')[1].split('```')[0].trim();
        }

        return JSON.parse(jsonText);

    } catch (error) {
        console.error('房间分析失败:', error);
        // 返回默认值（根据语言）
        const defaults = language === 'zh' ? {
            room_type: roomPurposeHint || "未知",
            area_range: "15-20",
            ceiling_height: "2.6-2.8",
            space_feeling: "适中",
            natural_light: "一般",
            existing_furniture: "空房",
            floor_type: "木地板",
            floor_color: "#D2B48C",
            wall_color: "#FFFFFF",
            overall_condition: "新房",
            style_hints: "现代简约"
        } : {
            room_type: roomPurposeHint || "Unknown",
            area_range: "15-20",
            ceiling_height: "2.6-2.8",
            space_feeling: "Moderate",
            natural_light: "Average",
            existing_furniture: "Empty",
            floor_type: "Wooden Floor",
            floor_color: "#D2B48C",
            wall_color: "#FFFFFF",
            overall_condition: "New",
            style_hints: "Modern Minimalist"
        };
        return defaults;
    }
}

/**
 * 生成设计方案
 */
async function generateDesignPlan(roomAnalysis, userRequirements, language = 'en') {
    try {
        // 构建特殊需求的约束条件（使用多语言版本）
        const specialConstraints = buildSpecialConstraints(userRequirements.special_needs, language);

        // 使用多语言 Prompt 配置
        const prompt = getDesignPlanPrompt(roomAnalysis, userRequirements, specialConstraints, language);

        console.log(`生成设计方案 (语言: ${language})`);

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

        return JSON.parse(jsonText);

    } catch (error) {
        console.error('生成设计方案失败:', error);
        throw error;
    }
}

/**
 * 生成购物清单
 */
async function generateShoppingList(designPlan, userRequirements, language = 'en') {
    try {
        // 使用多语言 Prompt 配置
        const prompt = getShoppingListPrompt(designPlan, userRequirements, language);

        console.log(`生成购物清单 (语言: ${language})`);

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
        return [];
    }
}

/**
 * 生成渲染图
 */
async function generateRenderedImage(photo, designPlan, language = 'en') {
    try {
        console.log(`调用 Gemini 2.5 Flash Image 生成渲染图 (语言: ${language})...`);

        const { fileToGenerativePart } = require('./aiService');
        const imagePart = fileToGenerativePart(photo.filepath, photo.mimetype);

        // 使用多语言 Prompt 配置
        const renderPrompt = getRenderImagePrompt(designPlan, language);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: [imagePart, { text: renderPrompt }]
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
    generateCustomizationPlan
};
