const { checkSchema } = require("express-validator");
const { comparePassword } = require("@/utils/bcrytp");
const sendUnverifiedUserEmail = require("@/utils/sendUnverifiedUserEmail");
const handleValidationErrors = require("./handleValidationErrors");
const userService = require("@/services/user.service");

exports.edit = [
  checkSchema({
    firstName: {
      notEmpty: {
        errorMessage: "Registration failed: Please enter your first name.",
      },
    },
    lastName: {
      notEmpty: {
        errorMessage: "Registration failed: Please enter your last name.",
      },
    },
    email: {
      notEmpty: {
        errorMessage: "Registration failed: Please enter your email.",
      },
      isEmail: {
        errorMessage: "Registration failed: Not a valid e-mail address.",
      },
      custom: {
        options: async (value, { req }) => {
          const user = await userService.getByEmail(value);
          if (user) {
            throw new Error(
              "Registration failed: This email has already existed."
            );
          }
        },
      },
    },

    password: {
      notEmpty: {
        errorMessage: "Registration failed: Please enter your password.",
      },
      isStrongPassword: {
        errorMessage:
          "Registration failed: Password must contain at least 8 characters, including uppercase, lowercase, number, and symbol.",
      },
    },

    confirmPassword: {
      notEmpty: {
        errorMessage:
          "Registration failed: Please enter your confirm password.",
      },
      custom: {
        options: async (value, { req }) => value === req.body.password,
        errorMessage: "Registration failed: Passwords do not match.",
      },
    },

    agreeToTerms: {
      custom: {
        options: (value) => {
          return value === true || value === "true";
        },
        errorMessage: "Registration failed: You must agree to the terms.",
      },
    },
  }),

  handleValidationErrors,
];
