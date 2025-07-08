const express = require("express");
const authController = require("@/controllers/api/auth.controller");
const router = express.Router();
// const authValidator = require("@/validators/admin/auth.validator");

// router.get("/login", authController.showLoginForm);
// router.post("/login", authValidator.login, authController.login);
router.post("/register", authController.register);
// router.get("/reset-password", authController.showResetForm);
// router.get("/forgot-password", authController.showForgotForm);
// router.post("/forgot-password", authController.sendForgotEmail);
// router.post("/logout", authController.logout);
// router.get("/verify-email", authController.verifyEmail);

module.exports = router;
