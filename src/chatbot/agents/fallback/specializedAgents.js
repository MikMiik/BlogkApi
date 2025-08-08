// User Support Specialized Agents
const accountAgent = require("./userSupport/accountAgent");
const postManagementAgent = require("./userSupport/postManagementAgent");
const socialAgent = require("./userSupport/socialAgent");

// Technical Specialized Agents
const troubleshootingAgent = require("./technical/troubleshootingAgent");
const performanceAgent = require("./technical/performanceAgent");

// Content Specialized Agents
const writingTipsAgent = require("./content/writingTipsAgent");
const analyticsAgent = require("./content/analyticsAgent");

// SEO Specialized Agents
const keywordAgent = require("./seo/keywordAgent");
const technicalSeoAgent = require("./seo/technicalSeoAgent");
const contentSeoAgent = require("./seo/contentSeoAgent");

module.exports = {
  // User Support
  accountAgent,
  postManagementAgent,
  socialAgent,

  // Technical
  troubleshootingAgent,
  performanceAgent,

  // Content
  writingTipsAgent,
  analyticsAgent,

  // SEO
  keywordAgent,
  technicalSeoAgent,
  contentSeoAgent,
};
