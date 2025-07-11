const express = require("express");
const router = express.Router();

// const productsRouter = require("./products.route");
const authRouter = require("./auth.route");
const postsRouter = require("./posts.route");
// const commentsRouter = require("./comments.route");
const usersRouter = require("./users.route");

// router.use("/products", productsRouter);
router.use("/auth", authRouter);
router.use("/posts", postsRouter);
// router.use("/comments", commentsRouter);
router.use("/users", usersRouter);

module.exports = router;
