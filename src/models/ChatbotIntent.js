"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ChatbotIntent extends Model {
    static associate(models) {
      ChatbotIntent.hasMany(models.ChatbotTrainingExample, {
        foreignKey: "intentId",
        as: "examples",
        onDelete: "CASCADE",
      });

      ChatbotIntent.hasMany(models.ChatbotPattern, {
        foreignKey: "intentId",
        as: "patterns",
        onDelete: "CASCADE",
      });
    }

    // Instance methods
    async getTrainingStats() {
      const examples = await this.getExamples({ where: { isActive: true } });
      const patterns = await this.getPatterns({ where: { isActive: true } });

      return {
        totalExamples: examples.length,
        totalPatterns: patterns.length,
        lastTrained: this.lastTrained,
        needsTraining: examples.length >= 10 && !this.lastTrained,
        agentName: this.agentName,
        isActive: this.isActive,
      };
    }

    async updateStats() {
      const examples = await this.getExamples({ where: { isActive: true } });
      const patterns = await this.getPatterns({ where: { isActive: true } });

      await this.update({
        totalExamples: examples.length,
        totalPatterns: patterns.length,
      });
    }

    // Static methods
    static async findOrCreateByAgentName(agentName) {
      const [intent, created] = await ChatbotIntent.findOrCreate({
        where: { agentName },
        defaults: {
          agentName,
          totalExamples: 0,
          totalPatterns: 0,
          isActive: true,
        },
      });

      return { intent, created };
    }

    static async getActiveIntents() {
      return await ChatbotIntent.findAll({
        where: { isActive: true },
        include: [
          {
            model: sequelize.models.ChatbotTrainingExample,
            as: "examples",
            where: { isActive: true },
            required: false,
          },
          {
            model: sequelize.models.ChatbotPattern,
            as: "patterns",
            where: { isActive: true },
            required: false,
          },
        ],
      });
    }
  }

  ChatbotIntent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      agentName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      totalExamples: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      totalPatterns: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      lastTrained: {
        type: DataTypes.DATE,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ChatbotIntent",
      tableName: "chatbot_intents",
      timestamps: true,
      indexes: [
        {
          fields: ["agentName"],
        },
        {
          fields: ["isActive"],
        },
      ],
    }
  );

  return ChatbotIntent;
};
