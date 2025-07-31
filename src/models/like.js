"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Like.init(
    {
      userId: DataTypes.INTEGER,

      likableId: DataTypes.INTEGER,

      likableType: DataTypes.STRING(255),

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Like",
      tableName: "likes",
      timestamps: true,
    }
  );

  //   const modelMap = {
  //     Post: sequelize.models.Post,
  //     Comment: sequelize.models.Comment,
  //   };

  //   const Model = modelMap[like.likableType];
  //   if (Model) {
  //     await Model.increment("likesCount", {
  //       by: 1,
  //       where: { id: like.likableId },
  //     });
  //   }
  // });

  // Like.addHook("afterDestroy", async (like, options) => {
  //   const modelMap = {
  //     Post: sequelize.models.Post,
  //     Comment: sequelize.models.Comment,
  //   };

  //   const Model = modelMap[like.likableType];
  //   if (Model) {
  //     await Model.decrement("likesCount", {
  //       by: 1,
  //       where: { id: like.likableId },
  //     });
  //   }
  // });

  return Like;
};
