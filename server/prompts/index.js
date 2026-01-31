// prompts/index.js

/**
 * Prompt 工程体系入口文件
 * 导出所有 Builder 类
 */

const BasePromptBuilder = require('./builders/BasePromptBuilder');
const RoomCustomizationBuilder = require('./builders/RoomCustomizationBuilder');
const DreamHomeBuilder = require('./builders/DreamHomeBuilder');
const RoomScoringBuilder = require('./builders/RoomScoringBuilder');
const PlacementBuilder = require('./builders/PlacementBuilder');

module.exports = {
    BasePromptBuilder,
    RoomCustomizationBuilder,
    DreamHomeBuilder,
    RoomScoringBuilder,
    PlacementBuilder
};
