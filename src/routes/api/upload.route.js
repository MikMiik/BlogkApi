const handleUpload = require("@/middlewares/handleUpload");
const uploadController = require("@/controllers/api/upload.controller");
const express = require("express");
const ensureAsyncContext = require("@/utils/asyncHooks");
const router = express.Router();

// router.post("/", uploadController.);
router.post(
  "/",
  ensureAsyncContext(handleUpload.single("image")),
  uploadController.upload
);
module.exports = router;
