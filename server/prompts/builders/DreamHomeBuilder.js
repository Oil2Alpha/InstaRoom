// prompts/builders/DreamHomeBuilder.js

const BasePromptBuilder = require('./BasePromptBuilder');

/**
 * 梦中情家 Prompt 构建器
 */
class DreamHomeBuilder extends BasePromptBuilder {
    /**
     * 创建改造指令构建器
     */
    static createImprovementBuilder() {
        return new DreamHomeImprovementBuilder();
    }

    /**
     * 创建购物清单构建器
     */
    static createShoppingListBuilder() {
        return new DreamHomeShoppingListBuilder();
    }
}

/**
 * 梦中情家 - 改造指令构建器
 */
class DreamHomeImprovementBuilder extends BasePromptBuilder {
    constructor() {
        super('dream-home/improvement-prompt.xml');
    }

    /**
     * 设置评分数据
     * @param {object} scoreData - 评分数据 {score, suggestions}
     * @returns {DreamHomeImprovementBuilder} this
     */
    setScoreData(scoreData) {
        const { score, suggestions } = scoreData;

        // 格式化建议
        let suggestionTexts = '无具体建议';
        if (suggestions && suggestions.length > 0) {
            suggestionTexts = suggestions.map(s => {
                const text = typeof s === 'string' ? s : (s.suggestion || s);
                return `- ${text}`;
            }).join('\n');
        }

        this.setVariable('score', score || 0);
        this.setVariable('suggestions', suggestionTexts);

        return this;
    }
}

/**
 * 梦中情家 - 购物清单构建器
 */
class DreamHomeShoppingListBuilder extends BasePromptBuilder {
    constructor() {
        super(
            'dream-home/shopping-list.xml',
            'dream-home/shopping-list-examples.json'
        );
    }

    /**
     * 设置优化建议
     * @param {Array} suggestions - 优化建议数组
     * @returns {DreamHomeShoppingListBuilder} this
     */
    setSuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            this.setVariable('suggestions', '无具体建议');
            return this;
        }

        // 格式化建议
        const formattedSuggestions = suggestions.map((s, i) => {
            const text = typeof s === 'string' ? s : (s.suggestion || s);
            return `${i + 1}. ${text}`;
        }).join('\n');

        this.setVariable('suggestions', formattedSuggestions);

        return this;
    }

    /**
     * 根据建议类型自动选择相关示例
     * @param {Array} suggestions - 优化建议数组
     * @param {number} limit - 最多选择几个示例（默认 2）
     * @returns {DreamHomeShoppingListBuilder} this
     */
    addRelevantExamples(suggestions, limit = 2) {
        if (!suggestions || suggestions.length === 0) {
            return this;
        }

        // 根据建议内容匹配示例类别
        const categories = [];
        suggestions.forEach(s => {
            const text = (typeof s === 'string' ? s : (s.suggestion || s)).toLowerCase();
            if (text.includes('绿植') || text.includes('植物')) {
                categories.push('增加绿植');
            }
            if (text.includes('照明') || text.includes('灯')) {
                categories.push('改善照明');
            }
            if (text.includes('装饰') || text.includes('挂画') || text.includes('抱枕')) {
                categories.push('增加装饰');
            }
        });

        // 选择匹配的示例
        categories.slice(0, limit).forEach(category => {
            this.selectExamplesByCategory(category, 1);
        });

        // 如果示例不足，随机选择其他示例
        if (this.selectedExamples.length < limit && this.allExamples.length > 0) {
            const remaining = limit - this.selectedExamples.length;
            const otherExamples = this.allExamples
                .filter(ex => !categories.includes(ex.category))
                .slice(0, remaining);
            this.addExamples(otherExamples);
        }

        return this;
    }
}

module.exports = DreamHomeBuilder;
