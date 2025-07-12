module.exports = {
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "264fcccfa34b16241f8b176b45fdfde7f907e63d394f10a788f25b242ea9e15a",
  JWT_EXPIRES_IN: parseInt(process.env.JWT_EXPIRES_IN) || 3600,
  REFRESH_TOKEN_EXPIRES_IN:
    parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) || 30 * 24 * 60 * 60,
  TOKEN_TYPE: process.env.TOKEN_TYPE || "Bearer",
  MAIL_JWT_SECRET:
    process.env.MAIL_JWT_SECRET ||
    "80e5bec17705897df5f5137067644e5dc0c93cca3a6c7bddf4f02974d3d8b942",
  MAIL_JWT_EXPIRES_IN: parseInt(process.env.MAIL_JWT_EXPIRES_IN) || 3600,
  MAIL_TOKEN_TYPE: process.env.MAIL_TOKEN_TYPE || "Bearer",
};
