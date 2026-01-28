// 实现尺寸校准的逻辑

const { ai, fileToGenerativePart, cleanupTempFile } = require('./aiService');
const { generateDimensionsPrompt } = require('../config/prompts');
const { REFERENCE_OBJECTS } = require('../config/constants');

/**
 * 调用 Gemini Agent 进行高精度的 3D 尺寸校准计算。
 * 
 * @param {object[]} photos - 上传的照片文件数组 (至少 2 张)
 * @param {string} referenceObject - 参考物 Key (如 'Coke_Can')
 * @param {object[]} furnitureDescriptions - 待测量家具的名称和描述
 * @returns {object} 包含计算尺寸的 JSON 结构
 */
async function getCalculatedDimensions(photos, referenceObject, furnitureDescriptions) {
    
    // 1. 验证输入
    if (!photos || photos.length < 2) {
        throw new Error("尺寸计算需要至少 2 张照片以进行透视校准。");
    }
    if (!REFERENCE_OBJECTS[referenceObject]) {
        throw new Error("参考物类型无效。");
    }

    const tempFilePaths = photos.map(p => p.filepath);
    
    try {
        // 2. 准备 Gemini API 的视觉输入
        const imageParts = photos.map(photo => 
            fileToGenerativePart(photo.filepath, photo.mimetype)
        );

        // 3. 准备 Prompt 输入数据
        const inputDetails = {
            referenceObject,
            furnitureDescriptions
        };
        const prompt = generateDimensionsPrompt(inputDetails);

        // 4. 调用 Gemini API
        // 使用 gemini-3 以获得更高的推理准确性，尤其对于复杂的几何任务。
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: [
                ...imageParts, // 传入所有图片
                { text: prompt } // 传入详细指令
            ],
            config: {
                responseMimeType: "application/json", 
                temperature: 0.1 
            }
        });

        // 5. 解析和验证结果
        let resultJson;
        const rawText = response.text.trim();
        
        console.log("--- RAW DIMENSIONS RESPONSE START ---");
        console.log(rawText);
        console.log("--- RAW DIMENSIONS RESPONSE END ---");

        try {
            resultJson = JSON.parse(rawText);
        } catch (e) {
            console.error("Gemini did not return valid JSON for dimensions. Error:", e.message);
            throw new Error("AI 尺寸计算模型输出格式错误，请检查 Prompt。");
        }

        return resultJson;

    } catch (error) {
        console.error("Error during dimensions service:", error.message);
        throw error;
    } finally {
        // 6. 清理临时文件 (无论成功或失败)
        // 尺寸测量非最后一步，不要在此清理临时文件
        //tempFilePaths.forEach(p => cleanupTempFile(p));
    }
}

module.exports = {
    getCalculatedDimensions
};