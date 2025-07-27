const { createNamespace } = require("cls-hooked");
const session = createNamespace("my session");

const setContext = (req, res, next) => {
  if (req.userId) {
    session.run(() => {
      session.set("userId", req.userId);
    });
  }
  next();
};

module.exports = { setContext, session };
