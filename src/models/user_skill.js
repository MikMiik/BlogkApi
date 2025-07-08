"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User_Skill extends Model {
    static associate(models) {
      // define association here
    }
  }
  User_Skill.init(
    {
      userId: DataTypes.INTEGER.UNSIGNED,

      skillId: DataTypes.INTEGER.UNSIGNED,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User_Skill",
      tableName: "user_skill",
      timestamps: true,
    }
  );
  return User_Skill;
};
