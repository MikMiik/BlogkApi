const express = require("express");
const router = express.Router();

const usersController = require("@/controllers/api/user.controller");

// Users
router.get("/", usersController.getList);
router.get("/:id", usersController.getOne);
// router.user("/", usersController.create);
// router.put("/:user", usersController.update);
// router.patch("/:user", usersController.update);
// router.delete("/:user", usersController.remove);

module.exports = router;
