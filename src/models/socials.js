"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Social extends Model {
    static associate(models) {
      // define association here
    }
  }
  Social.init(
    {
      userId: { type: DataTypes.INTEGER.UNSIGNED, unique: true },

      platform: DataTypes.STRING(191),

      url: DataTypes.STRING(191),

      icon: DataTypes.STRING(191),

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Social",
      tableName: "social",
      timestamps: true,
    }
  );
  return Social;
};
