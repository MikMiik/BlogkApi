"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ChatbotPattern extends Model {
    static associate(models) {
      ChatbotPattern.belongsTo(models.ChatbotIntent, {
        foreignKey: "intentId",
        as: "intent",
      });
    }

    // Static methods
    static async findByIntentName(agentName) {
      return await ChatbotPattern.findAll({
        include: [
          {
            model: sequelize.models.ChatbotIntent,
            as: "intent",
            where: { agentName, isActive: true },
          },
        ],
        where: { isActive: true },
        order: [["score", "DESC"]],
      });
    }

    static async getTopPatterns(agentName, limit = 20) {
      return await ChatbotPattern.findAll({
        include: [
          {
            model: sequelize.models.ChatbotIntent,
            as: "intent",
            where: { agentName, isActive: true },
          },
        ],
        where: { isActive: true },
        order: [["score", "DESC"]],
        limit,
      });
    }

    static async bulkCreatePatterns(intentId, patterns) {
      const patternData = patterns.map((pattern) => ({
        intentId,
        keyword: pattern.keyword,
        score: pattern.score,
        frequency: pattern.frequency || 1,
        isActive: true,
      }));

      return await ChatbotPattern.bulkCreate(patternData, {
        updateOnDuplicate: ["score", "frequency", "updatedAt"],
      });
    }

    static async updatePatternScores(
      intentId,
      keywordFrequencies,
      totalExamples
    ) {
      // Clear existing patterns for this intent
      await ChatbotPattern.update({ isActive: false }, { where: { intentId } });

      // Create new patterns
      const patterns = Object.entries(keywordFrequencies)
        .map(([keyword, freq]) => ({
          keyword,
          score: freq / totalExamples,
          frequency: freq,
        }))
        .filter((pattern) => pattern.score >= 0.2) // Min 20% occurrence
        .sort((a, b) => b.score - a.score);

      if (patterns.length > 0) {
        await ChatbotPattern.bulkCreatePatterns(intentId, patterns);
      }

      return patterns;
    }
  }

  ChatbotPattern.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      intentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "chatbot_intents",
          key: "id",
        },
      },
      keyword: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      score: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
        validate: {
          min: 0.0,
          max: 1.0,
        },
      },
      frequency: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ChatbotPattern",
      tableName: "chatbot_patterns",
      timestamps: true,
      indexes: [
        {
          fields: ["intentId"],
        },
        {
          fields: ["keyword"],
        },
        {
          fields: ["score"],
        },
        {
          fields: ["isActive"],
        },
        {
          unique: true,
          fields: ["intentId", "keyword"],
          where: { isActive: true },
        },
      ],
    }
  );

  return ChatbotPattern;
};
