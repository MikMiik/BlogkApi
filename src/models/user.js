"use strict";
const { Model } = require("sequelize");
const { default: slugify } = require("slugify");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, {
        as: "posts",
      });
      User.belongsToMany(models.Achievement, {
        through: "achievement_user",
        foreignKey: "userId",
        otherKey: "achievementId",
        as: "achievements",
      });
      User.belongsToMany(models.Skill, {
        through: "user_skill",
        foreignKey: "userId",
        otherKey: "skillId",
        as: "skills",
      });
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

      name: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.getDataValue("firstName")} ${this.getDataValue("lastName")}`;
        },
      },

      username: { type: DataTypes.STRING(191), unique: true },

      birthday: DataTypes.DATE,

      twoFactorAuth: DataTypes.BOOLEAN,

      twoFactorSecret: DataTypes.STRING(50),

      avatar: DataTypes.STRING(255),

      coverImage: DataTypes.STRING(255),

      phone: { type: DataTypes.STRING(191), unique: true },

      role: { type: DataTypes.STRING(191), defaultValue: "User" },

      socials: DataTypes.JSON,

      postsCount: DataTypes.INTEGER,

      followersCount: DataTypes.INTEGER,

      followingCount: DataTypes.INTEGER,

      likesCount: DataTypes.INTEGER,

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
        beforeCreate: async (user, options) => {
          if (user.firstName || user.lastName) {
            const baseSlug = slugify(
              (user.firstName || "") + " " + (user.lastName || ""),
              {
                lower: true,
                strict: true,
              }
            );

            let slug = baseSlug;
            let counter = 1;

            // Tìm xem username đã tồn tại chưa
            const existingUser = await User.findOne({
              where: { username: slug },
            });

            while (existingUser) {
              slug = `${baseSlug}-${counter}`;
              counter++;

              // kiểm tra tiếp slug mới
              const exists = await User.findOne({
                where: { username: slug },
              });

              if (!exists) break;
            }

            user.username = slug;
          }
        },
      },
    }
  );
  return User;
};
