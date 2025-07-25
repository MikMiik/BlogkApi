const { createNamespace } = require("cls-hooked");
const session = createNamespace("my session");

const setContext = (req, res, next) => {
  session.run(() => {
    session.set("user", req.user); // giả sử đã xác thực
    next();
  });
};

module.exports = { setContext, session };
