const express = require("express");
const router = express.Router();
const settingController = require("@/controllers/api/setting.controller");
const settingValidator = require("@/validators/setting.validator");

router.post(
  "/",
  settingValidator.upsertSetting,
  settingController.upsertSetting
);
router.get("/:userId", settingController.getSettingByUserId);

module.exports = router;
