const express = require("express");
const authController = require("@/controllers/api/auth.controller");
const router = express.Router();
// const authValidator = require("@/validators/admin/auth.validator");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authController.me);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/verify-email", authController.verifyEmail);
// router.get("/reset-password", authController.showResetForm);
// router.get("/forgot-password", authController.showForgotForm);
// router.post("/forgot-password", authController.sendForgotEmail);

module.exports = router;
