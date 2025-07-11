const usersService = require("@/services/user.service");
const authService = require("@/services/auth.service");
const { deleteRefreshToken } = require("@/services/refreshToken.service");
// const transporter = require("@/configs/admin/mailer");
// const { createToken, verifyToken } = require("@/utils/jwt");
// const queue = require("@/utils/queue");

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
    const tokenData = await authService.register(data);
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

// exports.verifyEmail = async (req, res) => {
//   const token = req.query.token;
//   const result = verifyToken(token);
//   if (result.success) {
//     const userId = result.data.userId;
//     const user = await usersService.getById(userId);
//     if (user.verified_at) {
//       req.flash("info", "Verification link is expired or invalid");
//       console.log(req.flash);
//       return res.redirect("/admin/login");
//     }
//     await usersService.update(userId, {
//       verified_at: new Date(),
//     });
//     req.flash("success", "Verify success");
//     return res.redirect("/admin/login");
//   }
//   req.flash("error", "Verify failed");
//   res.redirect("/admin/login");
// };
