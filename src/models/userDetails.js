"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserDetail extends Model {
    static associate(models) {
      // define association here
    }
  }
  UserDetail.init(
    {
      userId: { type: DataTypes.INTEGER.UNSIGNED, unique: true },

      avatar: DataTypes.STRING(191),

      introduction: DataTypes.TEXT,

      gender: DataTypes.ENUM("Male", "Female", "Other"),

      birthday: DataTypes.DATE,

      address: DataTypes.STRING(191),

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserDetail",
      tableName: "userDetails",
      timestamps: true,
    }
  );
  return UserDetail;
};
