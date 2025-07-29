const express = require("express");
const router = express.Router();

const profilesController = require("@/controllers/api/profile.controller");
const profileValidator = require("@/validators/profile.validator");
const handleUpload = require("@/middlewares/handleUpload");
const ensureAsyncContext = require("@/utils/asyncHooks");

router.get("/", profilesController.searchUsers);

router.get("/:id/edit", profilesController.getOneToEdit);
router.get("/:id", profilesController.getOne);
router.post("/:username/follow", profilesController.follow);
router.delete("/:username/unfollow", profilesController.unfollow);
router.patch(
  "/:id/edit",
  ensureAsyncContext(
    handleUpload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
    ])
  ),
  profileValidator.edit,
  profilesController.update
);
router.put(
  "/:id/edit",
  ensureAsyncContext(
    handleUpload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
    ])
  ),
  profileValidator.edit,
  profilesController.update
);

module.exports = router;
