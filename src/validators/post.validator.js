const { checkSchema } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");

exports.write = [
  checkSchema({
    title: {
      trim: true,
      notEmpty: {
        errorMessage: "Title is required.",
      },
    },
    excerpt: {
      trim: true,
      notEmpty: {
        errorMessage: "Excerpt is required.",
      },
    },
  }),
  handleValidationErrors,
];
