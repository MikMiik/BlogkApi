"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create chatbot_intents table
    await queryInterface.createTable("chatbot_intents", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      agentName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      totalExamples: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      totalPatterns: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lastTrained: {
        type: Sequelize.DATE,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create chatbot_training_examples table
    await queryInterface.createTable("chatbot_training_examples", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      intentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "chatbot_intents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      confidence: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 1.0,
      },
      source: {
        type: Sequelize.STRING(50),
        defaultValue: "user_interaction",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create chatbot_patterns table
    await queryInterface.createTable("chatbot_patterns", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      intentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "chatbot_intents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      keyword: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      score: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
      },
      frequency: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create chatbot_classification_logs table
    await queryInterface.createTable("chatbot_classification_logs", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      selectedAgent: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      confidence: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
      },
      method: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      reasoning: {
        type: Sequelize.TEXT,
      },
      estimatedCost: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      sessionId: {
        type: Sequelize.STRING(255),
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex("chatbot_intents", ["agentName"]);
    await queryInterface.addIndex("chatbot_training_examples", ["intentId"]);
    await queryInterface.addIndex("chatbot_training_examples", ["text"], {
      type: "FULLTEXT",
    });
    await queryInterface.addIndex("chatbot_patterns", ["intentId"]);
    await queryInterface.addIndex("chatbot_patterns", ["keyword"]);
    await queryInterface.addIndex("chatbot_classification_logs", [
      "selectedAgent",
    ]);
    await queryInterface.addIndex("chatbot_classification_logs", ["method"]);
    await queryInterface.addIndex("chatbot_classification_logs", ["sessionId"]);
    await queryInterface.addIndex("chatbot_classification_logs", ["createdAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("chatbot_classification_logs");
    await queryInterface.dropTable("chatbot_patterns");
    await queryInterface.dropTable("chatbot_training_examples");
    await queryInterface.dropTable("chatbot_intents");
  },
};
