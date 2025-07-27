const jwtService = require("@/services/jwt.service");
const userService = require("@/services/user.service");
const isPublicRoute = require("../configs/publicPaths");

async function checkAuth(req, res, next) {
  try {
    const authHeader = req.headers?.authorization;
    if (isPublicRoute(req.path, req.method) && !authHeader) {
      return next();
    }
    if (!authHeader) {
      return res.error(401, { message: "Authorization header missing" });
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.error(401, {
        message: 'Invalid Authorization format. Format is "Bearer <token>"',
      });
    }
    const token = parts[1];

    const payload = jwtService.verifyAccessToken(token);

    req.userId = payload.userId;

    next();
  } catch (error) {
    return res.error(401, error.message);
  }
}

module.exports = checkAuth;
