const { User } = require("@/models");
const { hashPassword, comparePassword } = require("@/utils/bcrytp");
const jwtService = require("./jwt.service");
const refreshTokenService = require("@/services/refreshToken.service");
const queue = require("@/utils/queue");

const register = async (data) => {
  const user = await User.create({
    ...data,
    password: await hashPassword(data.password),
  });
  const tokenData = jwtService.generateMailToken(user.id);
  return { user, tokenData };
};

const login = async (req, email, password, rememberMe) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Invalid login information.");
  }

  if (!user.dataValues.verifiedAt) {
    const tokenData = jwtService.generateMailToken(user.dataValues.id);
    const verifyUrl = `${req.protocol}://${req.host}/api/v1/auth/verify-email?token=${tokenData.token}`;
    queue.dispatch("sendVerifyEmailJob", {
      userId: user.id,
      token: tokenData.token,
      verifyUrl,
    });
    throw new Error(
      "Your account has not verified yet, please check your email to verify"
    );
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error("Invalid login information");
  }

  const tokenData = jwtService.generateAccessToken(user.id);
  if (rememberMe) {
    const refreshToken = await refreshTokenService.createRefreshToken(user.id);

    return {
      ...tokenData,
      refreshToken: refreshToken.token,
    };
  }

  return {
    ...tokenData,
  };
};

const checkUser = async (accessToken) => {
  return jwtService.verifyAccessToken(accessToken);
};

const refreshAccessToken = async (refreshTokenString) => {
  const refreshToken =
    await refreshTokenService.findValidRefreshToken(refreshTokenString);
  if (!refreshToken) {
    throw new Error("Refresh token invalid");
  }

  const tokenData = jwtService.generateAccessToken(refreshToken.userId);
  const newRefreshToken = await refreshTokenService.createRefreshToken(
    refreshToken.userId
  );
  await refreshTokenService.deleteRefreshToken(refreshToken);

  return {
    ...tokenData,
    refreshToken: newRefreshToken.token,
  };
};

module.exports = {
  register,
  login,
  checkUser,
  refreshAccessToken,
};
