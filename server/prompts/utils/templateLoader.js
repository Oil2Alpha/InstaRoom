// prompts/utils/templateLoader.js

const fs = require('fs').promises;
const path = require('path');

/**
 * 加载 XML 模板文件
 * @param {string} templatePath - 相对于 prompts/templates 的路径
 * @returns {Promise<string>} 模板内容
 */
async function loadTemplate(templatePath) {
    try {
        const fullPath = path.join(__dirname, '..', 'templates', templatePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        return content;
    } catch (error) {
        console.error(`加载模板失败: ${templatePath}`, error);
        throw new Error(`无法加载模板: ${templatePath}`);
    }
}

/**
 * 加载 JSON 示例文件
 * @param {string} examplesPath - 相对于 prompts/templates 的路径
 * @returns {Promise<object>} 示例数据
 */
async function loadExamples(examplesPath) {
    try {
        const fullPath = path.join(__dirname, '..', 'templates', examplesPath);
        const content = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`加载示例失败: ${examplesPath}`, error);
        return { examples: [] };
    }
}

module.exports = {
    loadTemplate,
    loadExamples
};
