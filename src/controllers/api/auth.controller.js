const usersService = require("@/services/user.service");
const authService = require("@/services/auth.service");
const { deleteRefreshToken } = require("@/services/refreshToken.service");
const queue = require("@/utils/queue");
const { verifyAccessToken } = require("@/services/jwt.service");

exports.login = async (req, res) => {
  try {
    const tokenData = await authService.login(
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
    const verifyUrl = `${req.protocol}://${req.host}/api/v1/auth/verify-email?token=${tokenData.accessToken}`;
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

// exports.sendForgotEmail = async (req, res) => {
//   const message = {
//     from: process.env.MAIL_SENDER_FROM,
//     to: req.body.email,
//     subject: "Reset Link",
//     html: `
//     <div>
//       <p style = "color: red"> Bye </p>
//       <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPgVqPfCA2AvKZIYM_vcKxX0ZSxJBeb7YUDQ&s"/>
//     </div>
//     `,
//   };
//   await transporter.sendMail(message);
// };

exports.verifyEmail = async (req, res) => {
  const token = req.query.token;
  const result = verifyAccessToken(token);
  if (result) {
    const userId = result.userId;
    const user = await usersService.getById(userId);
    const tokenExpired = result.exp * 1000 < Date.now();
    console.log(tokenExpired);
    if (user.dataValues.verifiedAt || tokenExpired) {
      return res.error(403, "Verification token is invalid or expired");
    }
    await usersService.update(userId, {
      verifiedAt: new Date(),
    });
    return res.success(200, "Email verified successfully");
  }
  res.error(403, "Verification token is invalid or expired");
};
