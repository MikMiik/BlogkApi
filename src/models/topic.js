"use strict";
const { Model } = require("sequelize");
const { default: slugify } = require("slugify");
module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    static associate(models) {
      Topic.belongsToMany(models.Post, {
        through: "post_topic",
        foreignKey: "topicId",
        otherKey: "postId",
        as: "posts",
      });
    }
  }
  Topic.init(
    {
      name: DataTypes.STRING(191),

      description: DataTypes.STRING(191),

      slug: DataTypes.STRING(191),

      image: DataTypes.STRING(191),

      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },

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

  Topic.addHook("beforeCreate", async (topic, options) => {
    if (topic.name && !topic.slug) {
      const baseSlug = slugify(topic.name, {
        lower: true,
        strict: true,
      });
      let slug = baseSlug;

      let counter = 1;
      const existingSlug = await Topic.findOne({
        where: { slug },
      });
      while (existingSlug) {
        slug = `${baseSlug}-${counter}`;
        counter++;

        const exists = await Topic.findOne({
          where: { slug },
        });

        if (!exists) break;
      }
      topic.slug = slug;
    }
  });
  return Topic;
};
