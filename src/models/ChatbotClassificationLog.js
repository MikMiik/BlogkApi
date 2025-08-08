"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ChatbotClassificationLog extends Model {
    static associate(models) {
      ChatbotClassificationLog.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }

    // Static methods
    static async getClassificationStats(dateRange = 7) {
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - dateRange * 24 * 60 * 60 * 1000
      );

      const stats = await ChatbotClassificationLog.findAll({
        where: {
          createdAt: {
            [sequelize.Sequelize.Op.between]: [startDate, endDate],
          },
        },
        attributes: [
          "selectedAgent",
          "method",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
          [sequelize.fn("AVG", sequelize.col("confidence")), "avgConfidence"],
          [sequelize.fn("SUM", sequelize.col("estimatedCost")), "totalCost"],
        ],
        group: ["selectedAgent", "method"],
        order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      });

      return stats;
    }

    static async getMethodPerformance() {
      return await ChatbotClassificationLog.findAll({
        attributes: [
          "method",
          [sequelize.fn("COUNT", sequelize.col("id")), "totalRequests"],
          [sequelize.fn("AVG", sequelize.col("confidence")), "avgConfidence"],
          [sequelize.fn("SUM", sequelize.col("estimatedCost")), "totalCost"],
          [sequelize.fn("AVG", sequelize.col("estimatedCost")), "avgCost"],
        ],
        group: ["method"],
        order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      });
    }

    static async getAgentUsageStats(limit = 10) {
      return await ChatbotClassificationLog.findAll({
        attributes: [
          "selectedAgent",
          [sequelize.fn("COUNT", sequelize.col("id")), "totalUsage"],
          [sequelize.fn("AVG", sequelize.col("confidence")), "avgConfidence"],
        ],
        group: ["selectedAgent"],
        order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
        limit,
      });
    }

    static async logClassification(data) {
      return await ChatbotClassificationLog.create({
        message: data.message,
        selectedAgent: data.agentName,
        confidence: data.confidence,
        method: data.method,
        reasoning: data.reasoning,
        estimatedCost: data.cost || 0,
        sessionId: data.sessionId,
        userId: data.userId,
      });
    }

    static async getSessionHistory(sessionId, limit = 20) {
      return await ChatbotClassificationLog.findAll({
        where: { sessionId },
        order: [["createdAt", "DESC"]],
        limit,
        include: [
          {
            model: sequelize.models.User,
            as: "user",
            attributes: ["id", "username", "email"],
            required: false,
          },
        ],
      });
    }

    static async getRecentFailures(limit = 50) {
      return await ChatbotClassificationLog.findAll({
        where: {
          method: {
            [sequelize.Sequelize.Op.in]: ["error_fallback", "default_fallback"],
          },
        },
        order: [["createdAt", "DESC"]],
        limit,
      });
    }
  }

  ChatbotClassificationLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      selectedAgent: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      confidence: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        validate: {
          min: 0.0,
          max: 1.0,
        },
      },
      method: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isIn: [
            [
              "pattern_matching",
              "keyword_matching",
              "llm_classification",
              "default_fallback",
              "error_fallback",
            ],
          ],
        },
      },
      reasoning: {
        type: DataTypes.TEXT,
      },
      estimatedCost: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      sessionId: {
        type: DataTypes.STRING(255),
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "ChatbotClassificationLog",
      tableName: "chatbot_classification_logs",
      timestamps: true,
      indexes: [
        {
          fields: ["selectedAgent"],
        },
        {
          fields: ["method"],
        },
        {
          fields: ["sessionId"],
        },
        {
          fields: ["userId"],
        },
        {
          fields: ["createdAt"],
        },
        {
          fields: ["confidence"],
        },
      ],
    }
  );

  return ChatbotClassificationLog;
};
