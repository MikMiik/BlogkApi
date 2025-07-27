const { User } = require("@/models");
const { hashPassword, comparePassword } = require("@/utils/bcrytp");
const { verifyAccessToken, generateMailToken } = require("./jwt.service");
const {
  findValidRefreshToken,
  deleteRefreshToken,
} = require("./refreshToken.service");
const sendUnverifiedUserEmail = require("@/utils/sendUnverifiedUserEmail");
const buildTokenResponse = require("@/utils/buildTokenResponse");
const generateClientUrl = require("@/utils/generateClientUrl");
const userService = require("./user.service");
const queue = require("@/utils/queue");

const register = async (data) => {
  const user = await userService.create({
    ...data,
    password: await hashPassword(data.password),
  });

  sendUnverifiedUserEmail(user.id);
  return {
    message:
      "Registration successful. Please check your email to verify your account.",
  };
};

const login = async (data) => {
  try {
    const { email, rememberMe } = data;
    const user = await userService.getByEmail(email);
    const result = await buildTokenResponse({ userId: user.id, rememberMe });
    await userService.update(user.id, { lastLogin: new Date() });
    return result;
  } catch (err) {
    throw new Error("Failed to generate authentication tokens.");
  }
};

const checkUser = async (accessToken) => {
  return verifyAccessToken(accessToken);
};

const refreshAccessToken = async (refreshTokenString) => {
  const refreshToken = await findValidRefreshToken(refreshTokenString);
  if (!refreshToken) {
    throw new Error("Refresh token invalid");
  }
  try {
    const result = await buildTokenResponse({
      userId: refreshToken.userId,
      rememberMe: null,
      hasRefreshToken: true,
    });
    await deleteRefreshToken(refreshToken.token);
    return result;
  } catch (err) {
    throw new Error("Failed to generate authentication tokens.");
  }
};

const logout = async (refreshToken) => {
  if (!refreshToken)
    return {
      message: "No refresh token provided — assumed short session logout.",
    };
  await deleteRefreshToken(refreshToken);
  return {
    message: "Logout successfully",
  };
};

const sendForgotEmail = async (email) => {
  try {
    const user = await userService.getByEmail(email);
    if (user) {
      const tokenData = generateMailToken(user.id);
      const resetPasswordUrl = generateClientUrl("reset-password", {
        token: tokenData.token,
      });

      queue.dispatch("sendForgotPasswordEmailJob", {
        userId: user.id,
        token: tokenData.token,
        resetPasswordUrl,
      });
    }
    return {
      message:
        "If your email exists in our system, a password reset link has been sent.",
    };
  } catch (error) {
    throw new Error(
      "Failed to send password reset email. Please try again later."
    );
  }
};

module.exports = {
  register,
  login,
  checkUser,
  refreshAccessToken,
  logout,
  sendForgotEmail,
};
