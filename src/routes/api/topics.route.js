const express = require("express");
const router = express.Router();

const topicsController = require("@/controllers/api/topic.controller");

// Posts
router.get("/", topicsController.getList);
router.get("/:topic", topicsController.getOne);

module.exports = router;
