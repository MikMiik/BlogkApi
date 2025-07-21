const express = require("express");
const router = express.Router();

const profilesController = require("@/controllers/api/profile.controller");
const handleUpload = require("@/middlewares/handleUpload");

router.get("/:id/edit", profilesController.getOneToEdit);
router.get("/:id", profilesController.getOne);
router.patch(
  "/:id/edit",
  handleUpload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  profilesController.update
);
router.put(
  "/:id/edit",
  handleUpload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  profilesController.update
);

module.exports = router;
