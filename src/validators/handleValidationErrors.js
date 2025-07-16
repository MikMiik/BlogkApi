const { validationResult } = require("express-validator");

const handleValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formatted = errors
    .array({
      onlyFirstError: true,
    })
    // .map((error) => ({
    //   field: error.path,
    //   message: error.msg,
    // }));
    .reduce((errors, error) => {
      errors[error.path] = error.msg;

      return errors;
    }, {});
  res.error(401, formatted);
};

module.exports = handleValidationErrors;
