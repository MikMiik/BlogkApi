const usersService = require("@/services/user.service");
const authService = require("@/services/auth.service");
const { deleteRefreshToken } = require("@/services/refreshToken.service");
const queue = require("@/utils/queue");
const {
  verifyMailToken,
  generateAccessToken,
  generateMailToken,
} = require("@/services/jwt.service");
const { hashPassword } = require("@/utils/bcrytp");

exports.login = async (req, res) => {
  try {
    const tokenData = await authService.login(
      req,
      req.body.email,
      req.body.password,
      req.body.rememberMe
    );
    res.success(200, tokenData);
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.register = async (req, res) => {
  let { confirmPassword, agreeToTerms, ...data } = req.body;
  try {
    const { user, tokenData } = await authService.register(data);
    const verifyUrl = `http://localhost:5173/login?token=${tokenData.token}`;
    queue.dispatch("sendVerifyEmailJob", {
      userId: user.id,
      token: tokenData.token,
      verifyUrl,
    });
    res.success(201, tokenData);
  } catch (error) {
    res.error(400, error.message);
  }
};

exports.me = async (req, res) => {
  const accessToken = req.headers.authorization.replace("Bearer ", "");
  const { userId } = await authService.checkUser(accessToken);
  const user = await usersService.getById(userId);
  res.success(200, user);
};

exports.refreshToken = async (req, res) => {
  try {
    const tokenData = await authService.refreshAccessToken(
      req.body.refreshToken
    );
    res.success(200, tokenData);
  } catch (error) {
    res.error(403, error.message);
  }
};

exports.logout = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.error(400, "No token provided");
  await deleteRefreshToken(refreshToken);
  res.success(200, "Logged out successfully");
};

exports.sendForgotEmail = async (req, res) => {
  const user = await usersService.getByEmail(req.body.email);
  if (user) {
    const tokenData = generateMailToken(user.id);
    const verifyUrl = `http://localhost:5173/reset-password?token=${tokenData.token}`;
    queue.dispatch("sendForgotPasswordEmailJob", {
      userId: user.dataValues.id,
      token: tokenData.token,
      verifyUrl,
    });
  }
  res.success(200, "If that email exists, a reset link has been sent.");
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  const result = verifyMailToken(token);
  if (result) {
    const userId = result.userId;
    const user = await usersService.getById(userId);
    if (user.dataValues.verifiedAt) {
      return res.error(403, "Verification token is invalid or expired");
    }
    await usersService.update(userId, {
      verifiedAt: new Date(),
    });
    const { accessToken } = generateAccessToken(userId);
    return res.success(200, { accessToken });
  }
};

exports.verifyResetToken = async (req, res) => {
  const { token } = req.query;
  const result = verifyMailToken(token);
  res.success(200, { userId: result.userId });
};

exports.resetPassword = async (req, res) => {
  const password = await hashPassword(req.body.password);
  await usersService.update(req.body.userId, { password });
  res.success(200, "Reset password successful");
};
