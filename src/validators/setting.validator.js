const { checkSchema } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");
const userService = require("@/services/user.service");
const getCurrentUser = require("@/utils/getCurrentUser");

exports.upsertSetting = [
  checkSchema({
    email: {
      trim: true,
      optional: true,
      isEmail: {
        errorMessage: "Please enter a valid email address.",
      },
      custom: {
        options: async (value, { req }) => {
          if (!value) return true; // Skip validation if email is not provided

          const currentUserId = getCurrentUser();
          const existingUser = await userService.getByEmail(value);

          // Check if email exists and belongs to a different user
          if (existingUser && existingUser.id !== currentUserId) {
            throw new Error(
              "This email address is already in use by another account."
            );
          }
        },
      },
    },

    twoFactorSecret: {
      optional: true,
      custom: {
        options: (value, { req }) => {
          // Skip validation if twoFactorEnabled is false or twoFactorSecret is empty
          if (!req.body.twoFactorEnabled || !value || value === "") {
            return true;
          }

          // Check if it's exactly 6 digits
          if (!/^\d{6}$/.test(value)) {
            throw new Error("Two-factor secret must be exactly 6 digits.");
          }

          return true;
        },
      },
    },

    twoFactorEnabled: {
      optional: true,
      isBoolean: {
        errorMessage:
          "Two-factor authentication setting must be true or false.",
      },
    },

    defaultPostVisibility: {
      optional: true,
      isIn: {
        options: [["public", "private", "draft"]],
        errorMessage:
          "Default post visibility must be one of: public, private, draft.",
      },
    },

    profileVisibility: {
      optional: true,
      isIn: {
        options: [["public", "followers", "private"]],
        errorMessage:
          "Profile visibility must be one of: public, followers, private.",
      },
    },

    allowComments: {
      optional: true,
      isBoolean: {
        errorMessage: "Allow comments setting must be true or false.",
      },
    },

    showViewCounts: {
      optional: true,
      isBoolean: {
        errorMessage: "Show view counts setting must be true or false.",
      },
    },

    notiNewComments: {
      optional: true,
      isBoolean: {
        errorMessage:
          "New comments notification setting must be true or false.",
      },
    },

    notiNewLikes: {
      optional: true,
      isBoolean: {
        errorMessage: "New likes notification setting must be true or false.",
      },
    },

    notiNewFollowers: {
      optional: true,
      isBoolean: {
        errorMessage:
          "New followers notification setting must be true or false.",
      },
    },

    notiWeeklyDigest: {
      optional: true,
      isBoolean: {
        errorMessage:
          "Weekly digest notification setting must be true or false.",
      },
    },

    searchEngineIndexing: {
      optional: true,
      isBoolean: {
        errorMessage: "Search engine indexing setting must be true or false.",
      },
    },
  }),
  handleValidationErrors,
];
