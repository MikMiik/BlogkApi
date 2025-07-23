const handleUpload = require("@/middlewares/handleUpload");
const uploadController = require("@/controllers/api/upload.controller");
const express = require("express");
const router = express.Router();

// router.post("/", uploadController.);
router.post("/", handleUpload.single("image"), uploadController.upload);
module.exports = router;
