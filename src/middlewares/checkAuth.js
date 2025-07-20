const jwtService = require("@/services/jwt.service");
const userService = require("@/services/user.service");

async function checkAuth(req, res, next) {
  try {
    // const publicPaths = ["/about", "/contact", "/auth"];

    // const notAuthRequired =
    //   req.path === "/" || publicPaths.some((path) => req.path.startsWith(path));
    // if (notAuthRequired) {
    //   return next();
    // }
    const token = req.headers?.authorization?.replace("Bearer ", "");
    // if (!token) {
    //   return res.error(401, { message: "Token invalid", redirect: "/login" });

    // }
    if (token) {
      const payload = jwtService.verifyAccessToken(token);
      const user = await userService.getById(payload.userId);
      if (!user) {
        return res.error(401, "User not found");
      }
      req.user = user;
    }
    next();
  } catch (error) {
    return res.error(401, error.message);
  }
}

module.exports = checkAuth;
