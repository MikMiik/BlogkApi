"use strict";
const { Model } = require("sequelize");
const { default: slugify } = require("slugify");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      email: { type: DataTypes.STRING, allowNull: false, unique: true },

      password: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },

      firstName: DataTypes.STRING(191),

      lastName: DataTypes.STRING(191),

      username: { type: DataTypes.STRING(191), unique: true },

      phone: { type: DataTypes.STRING(191), unique: true },

      role: { type: DataTypes.STRING(191), defaultValue: "User" },

      status: DataTypes.STRING(191),

      lastLogin: DataTypes.DATE,

      verifiedAt: DataTypes.DATE,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeCreate: (user, options) => {
          if (user.firstName) {
            user.username = slugify(user.firstName + " " + user.lastName, {
              lower: true,
              strict: true,
            });
          }
        },
      },
    }
  );
  return User;
};
