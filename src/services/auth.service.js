const { User } = require("@/models");
const { hashPassword, comparePassword } = require("@/utils/bcrytp");
const jwtService = require("./jwt.service");
const refreshTokenService = require("@/services/refreshToken.service");

const register = async (data) => {
  const user = await User.create({
    ...data,
    email: data.email,
    password: await hashPassword(data.password),
  });

  return jwtService.generateAccessToken({ userId: user.id });
};

const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Thông tin đăng nhập không hợp lệ.");
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error("Thông tin đăng nhập không hợp lệ.");
  }

  const tokenData = jwtService.generateAccessToken(user.id);
  const refreshToken = await refreshTokenService.createRefreshToken(user.id);
  return {
    ...tokenData,
    refreshToken: refreshToken.token,
  };
};

const refreshAccessToken = async (refreshTokenString) => {
  const refreshToken = await refreshTokenService.findValidRefreshToken(
    refreshTokenString
  );
  if (!refreshToken) {
    throw new Error("Refresh token không hợp lệ");
  }

  const tokenData = jwtService.generateAccessToken(refreshToken.userId);
  await refreshTokenService.deleteRefreshToken(refreshToken);

  const newRefreshToken = await refreshTokenService.createRefreshToken(
    refreshToken.userId
  );

  return {
    ...tokenData,
    refreshToken: newRefreshToken.token,
  };
};

module.exports = {
  register,
  login,
  refreshAccessToken,
};
