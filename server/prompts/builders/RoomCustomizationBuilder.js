// prompts/builders/RoomCustomizationBuilder.js

const BasePromptBuilder = require('./BasePromptBuilder');

/**
 * 房间定制 Prompt 构建器
 * 专门用于房间分析功能，支持多语言
 */
class RoomCustomizationBuilder extends BasePromptBuilder {
    constructor(language = 'zh') {
        // 根据语言选择对应的模板和示例文件
        const lang = language === 'en' ? 'en' : 'zh';
        const templatePath = `room-customization/room-analysis.${lang}.xml`;
        const examplesPath = `room-customization/room-analysis-examples.${lang}.json`;

        super(templatePath, examplesPath);
        this.language = lang;
    }

    /**
     * 设置房间类型提示
     * @param {string} hint - 房间类型提示（如：客厅、卧室）
     * @returns {RoomCustomizationBuilder} this
     */
    setRoomTypeHint(hint) {
        const defaultHint = this.language === 'en' ? 'Unknown' : '未知';
        return this.setVariable('room_type_hint', hint || defaultHint);
    }

    /**
     * 根据房间类型自动选择相关示例
     * @param {string} roomType - 房间类型
     * @param {number} limit - 最多选择几个示例（默认 2）
     * @returns {RoomCustomizationBuilder} this
     */
    addRelevantExamples(roomType, limit = 2) {
        // 优先选择匹配的类别
        this.selectExamplesByCategory(roomType, limit);

        // 如果示例不足，随机选择其他示例
        if (this.selectedExamples.length < limit && this.allExamples.length > 0) {
            const remaining = limit - this.selectedExamples.length;
            const otherExamples = this.allExamples
                .filter(ex => ex.category !== roomType)
                .slice(0, remaining);
            this.addExamples(otherExamples);
        }

        return this;
    }
}

module.exports = RoomCustomizationBuilder;
