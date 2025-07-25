const { session } = require("@/middlewares/setContext");

function getCurrentUser() {
  return session.get("user");
}

module.exports = getCurrentUser;
