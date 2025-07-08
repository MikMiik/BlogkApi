"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Action extends Model {
    static associate(models) {
      // define association here
    }
  }
  Action.init(
    {
      name: { type: DataTypes.STRING(191), unique: true },

      description: DataTypes.STRING(191),

      icon: DataTypes.STRING(191),

      isActive: DataTypes.BOOLEAN,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Action",
      tableName: "actions",
      timestamps: true,
    }
  );
  return Action;
};
