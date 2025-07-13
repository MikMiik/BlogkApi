const transporter = require("@/configs/mailer");
const usersService = require("@/services/user.service");
const loadMail = require("@/utils/loadEmail");

async function sendForgotPasswordEmailJob(job) {
  const { userId, token, verifyUrl } = JSON.parse(job.payload);
  const user = await usersService.getById(userId);

  const template = await loadMail("verification", {
    token,
    userId: user.id,
    verifyUrl,
  });

  const message = {
    from: process.env.MAIL_SENDER_FROM,
    to: "minh093653243@gmail.com",
    subject: "Forgot Password Message",
    html: template,
  };
  await transporter.sendMail(message);
}

module.exports = sendForgotPasswordEmailJob;
