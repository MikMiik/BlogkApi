const transporter = require("@/configs/mailer");
const loadMail = require("@/utils/loadEmail");
const { mail } = require("@/configs");

async function sendForgotPasswordEmailJob(job) {
  const data = JSON.parse(job.payload);
  const template = await loadMail("forgotpassword", data);

  const message = {
    from: mail.SENDER_FROM,
    to: "minh093653243@gmail.com",
    subject: "Forgot Password Message",
    html: template,
  };
  await transporter.sendMail(message);
}

module.exports = sendForgotPasswordEmailJob;
