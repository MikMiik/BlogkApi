const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN, TOKEN_TYPE } = require("@/configs/auth");
const throwError = require("@/utils/throwError");

const generateAccessToken = (userId) => {
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    accessToken: token,
    tokenType: TOKEN_TYPE,
    expiresIn: JWT_EXPIRES_IN,
  };
};

const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throwError(401, `${err.name} ${err.message}`);
  }
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};
