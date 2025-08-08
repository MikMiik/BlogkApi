"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ChatbotTrainingExample extends Model {
    static associate(models) {
      ChatbotTrainingExample.belongsTo(models.ChatbotIntent, {
        foreignKey: "intentId",
        as: "intent",
      });
    }

    // Instance methods
    extractKeywords() {
      const stopWords = new Set([
        "tôi",
        "bạn",
        "là",
        "có",
        "được",
        "và",
        "để",
        "trong",
        "với",
        "của",
        "i",
        "you",
        "is",
        "are",
        "the",
        "and",
        "to",
        "in",
        "with",
        "for",
      ]);

      return this.text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word))
        .filter((word) => !word.match(/^\d+$/)); // Remove pure numbers
    }

    // Static methods
    static async findByIntentName(agentName) {
      return await ChatbotTrainingExample.findAll({
        include: [
          {
            model: sequelize.models.ChatbotIntent,
            as: "intent",
            where: { agentName, isActive: true },
          },
        ],
        where: { isActive: true },
        order: [["createdAt", "DESC"]],
      });
    }

    static async getRecentExamples(limit = 100) {
      return await ChatbotTrainingExample.findAll({
        where: { isActive: true },
        include: [
          {
            model: sequelize.models.ChatbotIntent,
            as: "intent",
            attributes: ["agentName"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
      });
    }

    static async searchByText(searchText) {
      return await ChatbotTrainingExample.findAll({
        where: {
          text: {
            [sequelize.Sequelize.Op.like]: `%${searchText}%`,
          },
          isActive: true,
        },
        include: [
          {
            model: sequelize.models.ChatbotIntent,
            as: "intent",
            attributes: ["agentName"],
          },
        ],
        order: [["confidence", "DESC"]],
      });
    }
  }

  ChatbotTrainingExample.init(
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
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 5000],
        },
      },
      confidence: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 1.0,
        validate: {
          min: 0.0,
          max: 1.0,
        },
      },
      source: {
        type: DataTypes.STRING(50),
        defaultValue: "user_interaction",
        validate: {
          isIn: [
            ["user_interaction", "manual", "auto_generated", "llm_feedback"],
          ],
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ChatbotTrainingExample",
      tableName: "chatbot_training_examples",
      timestamps: true,
      indexes: [
        {
          fields: ["intentId"],
        },
        {
          fields: ["confidence"],
        },
        {
          fields: ["source"],
        },
        {
          fields: ["isActive"],
        },
      ],
    }
  );

  return ChatbotTrainingExample;
};
