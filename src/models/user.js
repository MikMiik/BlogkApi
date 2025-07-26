"use strict";
const getCurrentUser = require("@/utils/getCurrentUser");
const { Model } = require("sequelize");
const { default: slugify } = require("slugify");
const baseURL = process.env.BASE_URL || "http://localhost:3000";
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

      User.hasOne(models.Privacy, { foreignKey: "userId", as: "privacy" });
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

      introduction: DataTypes.STRING(255),

      website: DataTypes.STRING(255),

      twoFactorAuth: DataTypes.BOOLEAN,

      twoFactorSecret: DataTypes.STRING(50),

      avatar: DataTypes.STRING(255),

      coverImage: DataTypes.STRING(255),

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

  User.addHook("afterFind", (result) => {
    const patchUser = (user) => {
      if (user.avatar && !user.avatar.startsWith("http")) {
        user.avatar = `${baseURL}/${user.avatar}`;
      }

      if (user.coverImage && !user.coverImage.startsWith("http")) {
        user.coverImage = `${baseURL}/${user.coverImage}`;
      }
    };

    if (Array.isArray(result)) {
      result.forEach(patchUser);
    } else if (result) {
      patchUser(result);
    }
  });

  User.addHook("afterFind", async (result) => {
    const user = getCurrentUser();
    const userId = user?.id;
    const { Follow } = sequelize.models;

    if (!userId) {
      if (Array.isArray(result)) {
        result.forEach((post) => {
          post.setDataValue("isFollowed", false);
        });
      } else if (result && result.id) {
        result.setDataValue("isFollowed", false);
      }
      return;
    }

    if (Array.isArray(result)) {
      const userIds = result.map((user) => user.id);

      const followeds = await Follow.findAll({
        where: {
          followerId: userId,
          followedId: userIds,
        },
      });

      const followedIds = new Set(followeds.map((f) => f.followedId));

      result.forEach((user) => {
        user.setDataValue("isFollowed", followedIds.has(user.id));
      });
    } else if (result && result.id) {
      const followed = await Follow.findOne({
        where: {
          followerId: userId,
          followedId: result.id,
        },
      });

      result.setDataValue("isFollowed", !!followed);
    }
  });
  return User;
};
