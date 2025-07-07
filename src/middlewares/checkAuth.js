const response = require("@/utils/response");
const { User } = require("@/models");
const jwtService = require("@/services/jwt.service");

async function checkAuth(req, res, next) {
  try {
    const token = req.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.error(401, "Token không được cung cấp");
    }

    const payload = jwtService.verifyAccessToken(token);

    const user = await User.findOne({
      attributes: ["id", "email", "createdAt"],
      where: { id: payload.userId },
    });

    if (!user) {
      return res.error(401, "User không tồn tại");
    }

    req.user = user;
    next();
  } catch (error) {
    return res.error(401, "Token không hợp lệ");
  }
}

module.exports = checkAuth;
