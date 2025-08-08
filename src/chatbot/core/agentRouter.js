// Import fallback agents
const defaultAgent = require("../agents/fallback/defaultAgent");
const blogWritingAgent = require("../agents/fallback/blogWritingAgent");
const contentAnalysisAgent = require("../agents/fallback/contentAnalysisAgent");
const seoAgent = require("../agents/fallback/seoAgent");
const technicalAgent = require("../agents/fallback/technicalAgent");
const userSupportAgent = require("../agents/fallback/userSupportAgent");

// Import specialized agents
const accountAgent = require("../agents/userSupport/accountAgent");
const postManagementAgent = require("../agents/userSupport/postManagementAgent");
const socialAgent = require("../agents/userSupport/socialAgent");
const troubleshootingAgent = require("../agents/technical/troubleshootingAgent");
const performanceAgent = require("../agents/technical/performanceAgent");
const writingTipsAgent = require("../agents/content/writingTipsAgent");
const analyticsAgent = require("../agents/content/analyticsAgent");
const keywordAgent = require("../agents/seo/keywordAgent");
const technicalSeoAgent = require("../agents/seo/technicalSeoAgent");
const contentSeoAgent = require("../agents/seo/contentSeoAgent");

class AgentRouter {
  constructor() {
    this.agentMap = new Map([
      // Specialized User Support Agents
      ["accountAgent", accountAgent],
      ["postManagementAgent", postManagementAgent],
      ["socialAgent", socialAgent],

      // Specialized Technical Agents
      ["troubleshootingAgent", troubleshootingAgent],
      ["performanceAgent", performanceAgent],

      // Specialized Content Agents
      ["writingTipsAgent", writingTipsAgent],
      ["analyticsAgent", analyticsAgent],

      // Specialized SEO Agents
      ["keywordAgent", keywordAgent],
      ["technicalSeoAgent", technicalSeoAgent],
      ["contentSeoAgent", contentSeoAgent],

      // Main agents (fallback)
      ["blogWritingAgent", blogWritingAgent],
      ["contentAnalysisAgent", contentAnalysisAgent],
      ["seoAgent", seoAgent],
      ["technicalAgent", technicalAgent],
      ["userSupportAgent", userSupportAgent],
      ["defaultAgent", defaultAgent],
    ]);
  }

  getAgent(agentName) {
    const agent = this.agentMap.get(agentName);
    if (!agent) {
      console.warn(
        `Agent not found: ${agentName}, falling back to defaultAgent`
      );
      return defaultAgent;
    }
    return agent;
  }

  getAgentConfig(agentName) {
    const agent = this.getAgent(agentName);
    return {
      systemPrompt: agent.systemPrompt,
      settings: agent.settings || {
        temperature: 0.5,
        max_output_tokens: 800,
        model: "gpt-4o-mini",
      },
    };
  }

  getAllAgentNames() {
    return Array.from(this.agentMap.keys());
  }

  getAgentsByCategory() {
    return {
      userSupport: ["accountAgent", "postManagementAgent", "socialAgent"],
      technical: ["troubleshootingAgent", "performanceAgent"],
      content: ["writingTipsAgent", "analyticsAgent"],
      seo: ["keywordAgent", "technicalSeoAgent", "contentSeoAgent"],
      general: [
        "blogWritingAgent",
        "contentAnalysisAgent",
        "seoAgent",
        "technicalAgent",
        "userSupportAgent",
      ],
      default: ["defaultAgent"],
    };
  }

  validateAgentName(agentName) {
    return this.agentMap.has(agentName);
  }

  getAgentInfo(agentName) {
    const agent = this.getAgent(agentName);
    if (!agent) return null;

    return {
      name: agentName,
      hasSystemPrompt: !!agent.systemPrompt,
      hasSettings: !!agent.settings,
      temperature: agent.settings?.temperature || 0.5,
      maxTokens: agent.settings?.max_output_tokens || 800,
      model: agent.settings?.model || "gpt-4o-mini",
      promptLength: agent.systemPrompt?.length || 0,
    };
  }

  getSystemStats() {
    const stats = {
      totalAgents: this.agentMap.size,
      categories: this.getAgentsByCategory(),
      agentDetails: {},
    };

    for (const [name, agent] of this.agentMap) {
      stats.agentDetails[name] = this.getAgentInfo(name);
    }

    return stats;
  }
}

module.exports = new AgentRouter();
