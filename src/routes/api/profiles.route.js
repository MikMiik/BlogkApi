const express = require("express");
const router = express.Router();

const profilesController = require("@/controllers/api/profile.controller");

router.get("/:id", profilesController.getOne);

module.exports = router;
