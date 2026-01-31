// prompts/builders/PlacementBuilder.js

const BasePromptBuilder = require('./BasePromptBuilder');

/**
 * 家具置换 Prompt 构建器
 */
class PlacementBuilder extends BasePromptBuilder {
    /**
     * 创建环境分析构建器
     */
    static createEnvironmentBuilder() {
        return new PlacementEnvironmentBuilder();
    }

    /**
     * 创建方案生成构建器
     */
    static createPlacementBuilder() {
        return new PlacementGenerationBuilder();
    }
}

/**
 * 家具置换 - 环境分析构建器
 */
class PlacementEnvironmentBuilder extends BasePromptBuilder {
    constructor() {
        super('placement/environment-analysis.xml');
    }

    /**
     * 设置房间类型
     * @param {string} roomType - 房间类型描述
     * @returns {PlacementEnvironmentBuilder} this
     */
    setRoomType(roomType) {
        this.setVariable('room_type', roomType || '房间');
        return this;
    }
}

/**
 * 家具置换 - 方案生成构建器
 */
class PlacementGenerationBuilder extends BasePromptBuilder {
    constructor() {
        super(
            'placement/placement-generation.xml',
            'placement/placement-examples.json'
        );
    }

    /**
     * 设置环境信息
     * @param {object} environment - 环境分析结果
     * @returns {PlacementGenerationBuilder} this
     */
    setEnvironment(environment) {
        this.setVariable('inherent_style', environment.inherent_style || '未知');
        this.setVariable('dominant_color_material', environment.dominant_color_material || '未知');
        this.setVariable('light_source_direction', environment.light_source_direction || '未知');
        this.setVariable('shadow_intensity', environment.shadow_intensity || '未知');
        return this;
    }

    /**
     * 设置家具信息
     * @param {object} furnitureInfo - 家具信息
     * @param {object} dimensions - 尺寸信息
     * @returns {PlacementGenerationBuilder} this
     */
    setFurniture(furnitureInfo, dimensions) {
        this.setVariable('furniture_name', furnitureInfo.name || '家具');
        this.setVariable('furniture_description', furnitureInfo.description || '无');
        this.setVariable('length_cm', dimensions.length_cm || 0);
        this.setVariable('width_cm', dimensions.width_cm || 0);
        this.setVariable('height_cm', dimensions.height_cm || 0);
        return this;
    }

    /**
     * 设置用户偏好
     * @param {object} preferences - 用户偏好
     * @returns {PlacementGenerationBuilder} this
     */
    setPreferences(preferences) {
        let preferencesText = '';

        if (preferences) {
            if (preferences.stylePreference && preferences.stylePreference.length > 0) {
                preferencesText += `\n- 风格偏好：${preferences.stylePreference.join('、')}`;
            }
            if (preferences.preferUsed) {
                preferencesText += `\n- 优先推荐二手家具`;
            }
            if (preferences.featureTags && preferences.featureTags.length > 0) {
                preferencesText += `\n- 特殊需求标签：${preferences.featureTags.join('、')}`;
            }
            if (preferences.budgetRange) {
                preferencesText += `\n- 预算范围：${preferences.budgetRange.min}-${preferences.budgetRange.max}元`;
            }
        }

        this.setVariable('preferences', preferencesText || '无特殊偏好');
        return this;
    }

    /**
     * 根据家具类型自动选择相关示例
     * @param {string} furnitureName - 家具名称
     * @param {number} limit - 最多选择几个示例（默认 1）
     * @returns {PlacementGenerationBuilder} this
     */
    addRelevantExamples(furnitureName, limit = 1) {
        if (!furnitureName) {
            return this;
        }

        // 根据家具名称匹配示例
        const matchedExamples = this.allExamples.filter(ex => {
            const category = ex.category.toLowerCase();
            return category.includes(furnitureName.toLowerCase());
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

module.exports = PlacementBuilder;
