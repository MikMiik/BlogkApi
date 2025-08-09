"use strict";
const getCurrentUser = require("@/utils/getCurrentUser");
const { Model } = require("sequelize");
const { default: slugify } = require("slugify");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, {
        as: "posts",
      });
      User.hasMany(models.Message, {
        as: "messages",
      });
      User.belongsToMany(models.Achievement, {
        through: "bookmarks",
        foreignKey: "userId",
        otherKey: "postId",
      });
      User.belongsToMany(models.Achievement, {
        through: "achievement_user",
        foreignKey: "userId",
        otherKey: "achievementId",
        as: "achievements",
      });
      User.belongsToMany(models.User, {
        through: "follows",
        foreignKey: "followedId",
        otherKey: "followerId",
        as: "followings",
      });
      User.belongsToMany(models.User, {
        through: "follows",
        foreignKey: "followerId",
        otherKey: "followedId",
        as: "followers",
      });

      User.belongsToMany(models.Conversation, {
        through: "conversation_participants",
        foreignKey: "userId",
        otherKey: "conversationId",
        as: "conversations",
      });

      User.belongsToMany(models.Notification, {
        through: "notification_user",
        foreignKey: "userId",
        otherKey: "notificationId",
        as: "notifications",
      });

      User.hasOne(models.Privacy, { foreignKey: "userId", as: "privacy" });
      User.hasOne(models.Setting, { foreignKey: "userId", as: "setting" });
    }
  }
  User.init(
    {
      email: { type: DataTypes.STRING, allowNull: false, unique: true },

      password: {
        type: DataTypes.STRING(191),
        allowNull: true,
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

      googleId: {
        type: DataTypes.STRING(255),
      },

      birthday: DataTypes.DATE,

      introduction: DataTypes.STRING(255),

      website: DataTypes.STRING(255),

      twoFactorAuth: DataTypes.BOOLEAN,

      twoFactorSecret: DataTypes.STRING(50),

      avatar: {
        type: DataTypes.STRING(255),
        get() {
          const raw = this.getDataValue("avatar");
          if (!raw) return null;
          return raw.startsWith("http")
            ? raw
            : `${process.env.BASE_URL}/${raw}`;
        },
      },

      coverImage: {
        type: DataTypes.STRING(255),
        get() {
          const raw = this.getDataValue("coverImage");
          if (!raw) return null;
          return raw.startsWith("http")
            ? raw
            : `${process.env.BASE_URL}/${raw}`;
        },
      },

      skills: DataTypes.JSON,

      phone: { type: DataTypes.STRING(191), unique: true },

      role: { type: DataTypes.STRING(191), defaultValue: "User" },

      socials: DataTypes.JSON,

      isFollowed: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("isFollowed");
        },
        set(value) {
          this.setDataValue("isFollowed", value);
        },
      },

      canViewProfile: {
        type: DataTypes.VIRTUAL,
      },

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
    }
  );

  // Handle username
  User.addHook("beforeCreate", async (user, options) => {
    if (options?.skipHandleUsername) return;
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

      const existingUser = await User.findOne({
        where: { username: slug },
        hooks: false,
      });

      while (existingUser) {
        slug = `${baseSlug}-${counter}`;
        counter++;

        const exists = await User.findOne({
          where: { username: slug },
          hooks: false,
        });

        if (!exists) break;
      }

      user.username = slug;
    }
  });

  // Handle isfollowed
  User.addHook("afterFind", async (result, options) => {
    if (options?.skipHandleIsFollowed) return;
    const userId = getCurrentUser();
    const { Follow } = sequelize.models;
    const users = Array.isArray(result) ? result : result ? [result] : [];

    if (users.length === 0) return;

    if (!userId) {
      users.forEach((u) => {
        u.setDataValue("isFollowed", false);
      });
    } else {
      const userIds = users.map((user) => user.id);

      const followeds = await Follow.findAll({
        where: {
          followerId: userId,
          followedId: userIds,
        },
      });

      const followedIds = new Set(followeds.map((f) => f.followedId));

      users.forEach((user) => {
        user.setDataValue("isFollowed", followedIds.has(user.id));
      });
    }
  });

  return User;
};
