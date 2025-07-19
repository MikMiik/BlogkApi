"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Achievement extends Model {
    static associate(models) {
      // define association here
    }
  }
  Achievement.init(
    {
      name: DataTypes.STRING(191),

      icon: DataTypes.STRING(191),

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Achievement",
      tableName: "achievements",
      timestamps: true,
    }
  );
  return Achievement;
};
