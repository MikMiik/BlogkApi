const express = require("express");
const router = express.Router();

// const productsRouter = require("./products.route");
const authRouter = require("./auth.route");
const uploadRouter = require("./upload.route");
const postsRouter = require("./posts.route");
const topicsRouter = require("./topics.route");
const commentsRouter = require("./comments.route");
const usersRouter = require("./users.route");
const profilesRouter = require("./profiles.route");
const messagesRouter = require("./messages.route");
const conversationsRouter = require("./conversation.route");
const notificationsRouter = require("./notification.route");

// router.use("/products", productsRouter);
router.use("/auth", authRouter);
router.use("/upload", uploadRouter);
router.use("/posts", postsRouter);
router.use("/topics", topicsRouter);
router.use("/comments", commentsRouter);
router.use("/users", usersRouter);
router.use("/profiles", profilesRouter);
router.use("/messages", messagesRouter);
router.use("/conversations", conversationsRouter);
router.use("/notifications", notificationsRouter);

module.exports = router;
