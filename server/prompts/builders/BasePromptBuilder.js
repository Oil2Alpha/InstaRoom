// prompts/builders/BasePromptBuilder.js

const { loadTemplate, loadExamples } = require('../utils/templateLoader');
const { renderTemplate, formatExamples, cleanXml } = require('../utils/xmlRenderer');

/**
 * 基础 Prompt 构建器
 * 提供模板加载、变量替换、示例管理等基础功能
 */
class BasePromptBuilder {
    /**
     * @param {string} templatePath - 模板文件路径（相对于 prompts/templates）
     * @param {string} examplesPath - 示例文件路径（可选）
     */
    constructor(templatePath, examplesPath = null) {
        this.templatePath = templatePath;
        this.examplesPath = examplesPath;
        this.template = null;
        this.allExamples = [];
        this.variables = {};
        this.selectedExamples = [];
    }

    /**
     * 加载模板和示例
     */
    async loadTemplate() {
        if (this.template) {
            return; // 已加载
        }

        this.template = await loadTemplate(this.templatePath);

        if (this.examplesPath) {
            const examplesData = await loadExamples(this.examplesPath);
            this.allExamples = examplesData.examples || [];
        }
    }

    /**
     * 设置单个变量
     * @param {string} key - 变量名
     * @param {any} value - 变量值
     * @returns {BasePromptBuilder} this（支持链式调用）
     */
    setVariable(key, value) {
        this.variables[key] = value;
        return this;
    }

    /**
     * 批量设置变量
     * @param {object} vars - 变量对象
     * @returns {BasePromptBuilder} this
     */
    setVariables(vars) {
        Object.assign(this.variables, vars);
        return this;
    }

    /**
     * 添加单个示例
     * @param {object} example - 示例对象
     * @returns {BasePromptBuilder} this
     */
    addExample(example) {
        this.selectedExamples.push(example);
        return this;
    }

    /**
     * 批量添加示例
     * @param {Array} examples - 示例数组
     * @returns {BasePromptBuilder} this
     */
    addExamples(examples) {
        this.selectedExamples.push(...examples);
        return this;
    }

    /**
     * 根据类别选择示例
     * @param {string} category - 类别名称
     * @param {number} limit - 最多选择几个示例（默认 3）
     * @returns {BasePromptBuilder} this
     */
    selectExamplesByCategory(category, limit = 3) {
        const filtered = this.allExamples.filter(ex => ex.category === category);
        const selected = filtered.slice(0, limit);
        this.selectedExamples.push(...selected);
        return this;
    }

    /**
     * 根据 ID 选择示例
     * @param {Array<string>} ids - 示例 ID 数组
     * @returns {BasePromptBuilder} this
     */
    selectExamplesById(ids) {
        const selected = this.allExamples.filter(ex => ids.includes(ex.id));
        this.selectedExamples.push(...selected);
        return this;
    }

    /**
     * 清空已选择的示例
     * @returns {BasePromptBuilder} this
     */
    clearExamples() {
        this.selectedExamples = [];
        return this;
    }

    /**
     * 构建最终的 Prompt
     * @returns {Promise<string>} 渲染后的 Prompt
     */
    async build() {
        // 确保模板已加载
        if (!this.template) {
            await this.loadTemplate();
        }

        // 准备变量（包括示例）
        const vars = {
            ...this.variables,
            examples: formatExamples(this.selectedExamples)
        };

        // 渲染模板
        let rendered = renderTemplate(this.template, vars);

        // 清理 XML
        rendered = cleanXml(rendered);

        return rendered;
    }

    /**
     * 重置构建器状态
     * @returns {BasePromptBuilder} this
     */
    reset() {
        this.variables = {};
        this.selectedExamples = [];
        return this;
    }
}

module.exports = BasePromptBuilder;
