const { User } = require("@/models");
const { hashPassword, comparePassword } = require("@/utils/bcrytp");
const jwtService = require("./jwt.service");
const refreshTokenService = require("@/services/refreshToken.service");

const register = async (data) => {
  const user = await User.create({
    ...data,
    password: await hashPassword(data.password),
  });
  const tokenData = jwtService.generateAccessToken(user.id);
  return { user, tokenData };
};

const login = async (email, password, rememberMe) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Thông tin đăng nhập không hợp lệ.");
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error("Thông tin đăng nhập không hợp lệ.");
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
