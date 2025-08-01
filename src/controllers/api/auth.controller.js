const usersService = require("@/services/user.service");
const authService = require("@/services/auth.service");
const {
  verifyMailToken,
  generateAccessToken,
} = require("@/services/jwt.service");
const { hashPassword } = require("@/utils/bcrytp");

exports.login = async (req, res) => {
  try {
    const data = (({ email, password, rememberMe }) => ({
      email,
      password,
      rememberMe,
    }))(req.body);
    const tokenData = await authService.login(data);
    res.success(200, tokenData);
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.register = async (req, res) => {
  let { confirmPassword, agreeToTerms, ...data } = req.body;
  try {
    const result = await authService.register(data);
    res.success(201, result);
  } catch (error) {
    res.error(400, error.message);
  }
};

exports.me = async (req, res) => {
  try {
    const accessToken = req.headers?.authorization?.replace("Bearer ", "");
    const { userId } = await authService.checkUser(accessToken);
    const user = await usersService.getById(userId);
    res.success(200, user);
  } catch (error) {
    res.error(401, error.message);
  }
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
  try {
    const result = await authService.logout(req.body.refreshToken);
    res.success(200, result);
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.sendForgotEmail = async (req, res) => {
  try {
    const result = await authService.sendForgotEmail(req.body.email);
    res.success(200, result);
  } catch (error) {
    res.error(500, error.message);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const { userId } = verifyMailToken(token);
    await usersService.update(userId, {
      verifiedAt: new Date(),
    });
    const { accessToken } = generateAccessToken(userId);
    return res.success(200, { accessToken });
  } catch (error) {
    res.error(500, error.message);
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    const { userId } = verifyMailToken(token);
    res.success(200, { userId });
  } catch (error) {
    res.error(401, error.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { userId } = verifyMailToken(token);
    const password = await hashPassword(req.body.password);
    const result = await usersService.update(userId, { password });
    res.success(200, { message: "Reset password successfully" });
  } catch (error) {
    res.error(401, error.message);
  }
};
