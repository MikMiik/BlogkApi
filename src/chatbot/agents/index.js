const defaultAgent = require("./fallback/defaultAgent");
const blogWritingAgent = require("./fallback/blogWritingAgent");
const contentAnalysisAgent = require("./fallback/contentAnalysisAgent");
const seoAgent = require("./fallback/seoAgent");
const technicalAgent = require("./fallback/technicalAgent");
const userSupportAgent = require("./fallback/userSupportAgent");

module.exports = {
  defaultAgent,
  blogWritingAgent,
  contentAnalysisAgent,
  seoAgent,
  technicalAgent,
  userSupportAgent,
};
