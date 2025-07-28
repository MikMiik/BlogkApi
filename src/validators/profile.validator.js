const { checkSchema } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");

exports.edit = [
  checkSchema({
    firstName: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter your first name",
      },
      isLength: {
        options: { min: 2 },
        errorMessage: "First name must be at least 2 characters",
      },
    },

    lastName: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter your last name",
      },
      isLength: {
        options: { min: 2 },
        errorMessage: "Last name must be at least 2 characters",
      },
    },

    username: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter your username",
      },
      matches: {
        options: /^[a-zA-Z0-9_-]+$/,
        errorMessage:
          "Username can only contain letters, numbers, hyphens and underscores",
      },
    },

    website: {
      optional: { options: { nullable: true } },
      custom: {
        options: (value) => {
          if (!value) return true;
          return value.startsWith("http://") || value.startsWith("https://");
        },
        errorMessage: "Website URL must start with http:// or https://",
      },
    },

    "socials.twitter": {
      optional: { options: { nullable: true } },
      custom: {
        options: (value) => {
          if (!value) return true;
          return value.startsWith("http://") || value.startsWith("https://");
        },
        errorMessage: "Twitter URL must start with http:// or https://",
      },
    },

    "socials.github": {
      optional: { options: { nullable: true } },
      custom: {
        options: (value) => {
          if (!value) return true;
          return value.startsWith("http://") || value.startsWith("https://");
        },
        errorMessage: "Github URL must start with http:// or https://",
      },
    },

    "socials.linkedin": {
      optional: { options: { nullable: true } },
      custom: {
        options: (value) => {
          if (!value) return true;
          return value.startsWith("http://") || value.startsWith("https://");
        },
        errorMessage: "LinkedIn URL must start with http:// or https://",
      },
    },
  }),

  handleValidationErrors,
];
