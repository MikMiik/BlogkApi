const usersService = require("@/services/user.service");
const md5 = require("md5");
const authService = require("@/services/auth.service");
// const transporter = require("@/configs/admin/mailer");
// const { createToken, verifyToken } = require("@/utils/jwt");
// const queue = require("@/utils/queue");

exports.login = async (req, res) => {
  const email = req.body.email;
  const password = md5(req.body.password);
  const user = await usersService.getByEmailAndPassword(email, password);

  if (user) {
    req.session.userId = user.id;
    req.flash("success", "Login successful");
    res.redirect("/admin");
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

// exports.logout = async (req, res) => {
//   delete req.session.userId;
//   return res.redirect("/admin/login");
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
