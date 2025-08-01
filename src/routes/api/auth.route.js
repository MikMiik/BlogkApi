const express = require("express");
const authController = require("@/controllers/api/auth.controller");
const router = express.Router();
const authValidator = require("@/validators/auth.validator");

router.post("/login", authValidator.login, authController.login);
router.post("/register", authValidator.register, authController.register);
router.get("/me", authController.me);
router.post(
  "/refresh-token",
  authValidator.refreshToken,
  authController.refreshToken
);
router.post("/logout", authValidator.refreshToken, authController.logout);
router.get("/verify-email", authController.verifyEmail);
router.post("/reset-password", authController.resetPassword);
router.post("/forgot-password", authController.sendForgotEmail);
router.get("/verify-reset-token", authController.verifyResetToken);

module.exports = router;
