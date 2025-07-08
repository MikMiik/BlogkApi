"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    static associate(models) {
      // define association here
    }
  }
  Topic.init(
    {
      name: DataTypes.STRING(191),

      description: DataTypes.STRING(191),

      icon: DataTypes.STRING(191),

      isActive: DataTypes.BOOLEAN,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Topic",
      tableName: "topics",
      timestamps: true,
    }
  );
  return Topic;
};
