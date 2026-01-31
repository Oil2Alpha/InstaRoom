// prompts/builders/RoomCustomizationBuilder.js

const BasePromptBuilder = require('./BasePromptBuilder');

/**
 * 房间定制 Prompt 构建器
 * 专门用于房间分析功能
 */
class RoomCustomizationBuilder extends BasePromptBuilder {
    constructor() {
        super(
            'room-customization/room-analysis.xml',
            'room-customization/room-analysis-examples.json'
        );
    }

    /**
     * 设置房间类型提示
     * @param {string} hint - 房间类型提示（如：客厅、卧室）
     * @returns {RoomCustomizationBuilder} this
     */
    setRoomTypeHint(hint) {
        return this.setVariable('room_type_hint', hint || '未知');
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
