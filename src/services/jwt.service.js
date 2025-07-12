const jwt = require("jsonwebtoken");
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  TOKEN_TYPE,
  MAIL_JWT_EXPIRES_IN,
  MAIL_TOKEN_TYPE,
  MAIL_JWT_SECRET,
} = require("@/configs/auth");
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

const generateMailToken = (userId) => {
  const token = jwt.sign({ userId }, MAIL_JWT_SECRET, {
    expiresIn: MAIL_JWT_EXPIRES_IN,
  });

  return {
    token,
    tokenType: MAIL_TOKEN_TYPE,
    expiresIn: MAIL_JWT_EXPIRES_IN,
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

const verifyMailToken = (token) => {
  try {
    const decoded = jwt.verify(token, MAIL_JWT_SECRET);
    return decoded;
  } catch (err) {
    throwError(401, `${err.name} ${err.message}`);
  }
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  verifyMailToken,
  generateMailToken,
};
