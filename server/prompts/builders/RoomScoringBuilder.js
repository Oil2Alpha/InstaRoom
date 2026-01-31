// prompts/builders/RoomScoringBuilder.js

const BasePromptBuilder = require('./BasePromptBuilder');

/**
 * 房间评分 Prompt 构建器
 */
class RoomScoringBuilder extends BasePromptBuilder {
    constructor() {
        super(
            'room-scoring/scoring.xml',
            'room-scoring/scoring-examples.json'
        );
    }

    /**
     * 设置关注点
     * @param {string} focusArea - 用户关注的特定方面（可选）
     * @returns {RoomScoringBuilder} this
     */
    setFocusArea(focusArea) {
        if (focusArea) {
            const focusText = `\n**用户关注点**：请特别评论房间在 [${focusArea}] 方面的表现。\n`;
            this.setVariable('focus_area', focusText);
        } else {
            this.setVariable('focus_area', '');
        }
        return this;
    }

    /**
     * 根据房间类型自动选择相关示例
     * @param {string} roomType - 房间类型（客厅、卧室、工作室等）
     * @param {number} limit - 最多选择几个示例（默认 2）
     * @returns {RoomScoringBuilder} this
     */
    addRelevantExamples(roomType, limit = 2) {
        if (!roomType) {
            // 如果没有指定类型，随机选择示例
            const randomExamples = this.allExamples.slice(0, limit);
            this.addExamples(randomExamples);
            return this;
        }

        // 根据房间类型匹配示例
        const typeKeywords = {
            '客厅': ['客厅', 'living'],
            '卧室': ['卧室', 'bedroom'],
            '书房': ['工作室', 'studio', '书房'],
            '工作室': ['工作室', 'studio']
        };

        const keywords = typeKeywords[roomType] || [roomType];
        const matchedExamples = this.allExamples.filter(ex => {
            const category = ex.category.toLowerCase();
            return keywords.some(kw => category.includes(kw.toLowerCase()));
        });

        if (matchedExamples.length > 0) {
            this.addExamples(matchedExamples.slice(0, limit));
        } else {
            // 如果没有匹配的，随机选择
            this.addExamples(this.allExamples.slice(0, limit));
        }

        return this;
    }
}

module.exports = RoomScoringBuilder;
