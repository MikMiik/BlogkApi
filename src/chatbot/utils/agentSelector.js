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

class AgentSelector {
  constructor() {
    this.agentKeywords = {
      // Specialized User Support Agents
      accountAgent: [
        "đăng nhập",
        "đăng ký",
        "tài khoản",
        "mật khẩu",
        "quên mật khẩu",
        "reset password",
        "verify email",
        "xác thực email",
        "login",
        "register",
        "account",
        "password",
        "authentication",
        "profile setup",
        "forgot password",
        "login error",
        "registration problem",
        "email verification",
        "account creation",
        "sign up",
        "sign in",
      ],
      postManagementAgent: [
        "viết bài",
        "tạo bài viết",
        "publish",
        "xuất bản",
        "draft",
        "bản nháp",
        "rich text editor",
        "quill editor",
        "cover image",
        "ảnh bìa",
        "excerpt",
        "tóm tắt",
        "tags",
        "topics",
        "chủ đề",
        "edit post",
        "sửa bài",
        "delete post",
        "xóa bài",
        "post management",
        "quản lý bài viết",
        "editor features",
        "writing workflow",
      ],
      socialAgent: [
        "follow",
        "theo dõi",
        "comment",
        "bình luận",
        "bookmark",
        "đánh dấu",
        "like",
        "thích",
        "social features",
        "tương tác",
        "interaction",
        "notification",
        "thông báo",
        "community",
        "cộng đồng",
        "share",
        "chia sẻ",
        "follower",
        "following",
        "social media",
        "engagement",
      ],

      // Specialized Technical Agents
      troubleshootingAgent: [
        "lỗi",
        "error",
        "bug",
        "không hoạt động",
        "not working",
        "issue",
        "vấn đề",
        "sự cố",
        "troubleshoot",
        "khắc phục",
        "fix",
        "sửa lỗi",
        "debug",
        "upload error",
        "lỗi tải lên",
        "login issue",
        "connection error",
        "browser problem",
        "compatibility issue",
        "crash",
        "freeze",
        "slow loading",
      ],
      performanceAgent: [
        "performance",
        "hiệu suất",
        "tốc độ",
        "speed",
        "optimization",
        "tối ưu hóa",
        "slow",
        "chậm",
        "loading time",
        "thời gian tải",
        "cache",
        "mobile performance",
        "responsive",
        "bandwidth",
        "compress",
        "optimize images",
        "lazy loading",
        "bundle size",
        "memory usage",
        "cpu usage",
      ],

      // Specialized Content Agents
      writingTipsAgent: [
        "viết tốt",
        "writing tips",
        "cách viết",
        "structure",
        "cấu trúc",
        "article structure",
        "technical writing",
        "viết kỹ thuật",
        "documentation",
        "tutorial writing",
        "blog writing",
        "content creation",
        "writing guide",
        "best practices",
        "engagement",
        "readability",
        "clear writing",
        "code examples",
        "presentation",
      ],
      analyticsAgent: [
        "analytics",
        "phân tích",
        "thống kê",
        "metrics",
        "chỉ số",
        "data analysis",
        "performance data",
        "insights",
        "trends",
        "xu hướng",
        "traffic analysis",
        "user behavior",
        "content performance",
        "engagement metrics",
        "growth analysis",
        "benchmarks",
        "reporting",
        "dashboard",
        "kpi",
      ],

      // Specialized SEO Agents
      keywordAgent: [
        "keyword",
        "từ khóa",
        "keyword research",
        "nghiên cứu từ khóa",
        "search terms",
        "long tail keywords",
        "keyword difficulty",
        "search volume",
        "keyword density",
        "target keywords",
        "primary keyword",
        "secondary keywords",
        "semantic keywords",
        "keyword optimization",
        "search intent",
        "keyword strategy",
        "competitor keywords",
        "ranking keywords",
      ],
      technicalSeoAgent: [
        "technical seo",
        "seo kỹ thuật",
        "core web vitals",
        "page speed",
        "tốc độ trang",
        "crawling",
        "indexing",
        "sitemap",
        "robots.txt",
        "structured data",
        "schema markup",
        "meta tags",
        "canonical",
        "redirects",
        "404 error",
        "https",
        "ssl",
        "mobile seo",
        "amp",
        "hreflang",
      ],
      contentSeoAgent: [
        "content seo",
        "seo nội dung",
        "on-page seo",
        "meta description",
        "title tag",
        "headers",
        "h1 h2 h3",
        "internal linking",
        "liên kết nội bộ",
        "content optimization",
        "tối ưu nội dung",
        "featured snippets",
        "user intent",
        "content depth",
        "readability",
        "content structure",
        "alt text",
        "image seo",
      ],

      // Main agents (fallback)
      blogWritingAgent: [
        "creative writing",
        "content ideas",
        "writing inspiration",
        "storytelling",
        "narrative",
        "creative content",
        "blog ideas",
        "writing style",
        "tone of voice",
      ],
      contentAnalysisAgent: [
        "content analytics",
        "nội dung tổng quan",
        "general analytics",
        "overview",
        "summary",
      ],
      seoAgent: [
        "seo tổng quan",
        "general seo",
        "search optimization",
        "ranking overview",
      ],
      technicalAgent: [
        "technical overview",
        "kỹ thuật tổng quan",
        "system",
        "infrastructure",
      ],
      userSupportAgent: [
        "support",
        "hỗ trợ",
        "help",
        "giúp đỡ",
        "general help",
        "contact",
        "liên hệ",
      ],
    };

    // Agent priority order (specialized agents first)
    this.agentPriority = [
      "accountAgent",
      "postManagementAgent",
      "socialAgent",
      "troubleshootingAgent",
      "performanceAgent",
      "writingTipsAgent",
      "analyticsAgent",
      "keywordAgent",
      "technicalSeoAgent",
      "contentSeoAgent",
      "blogWritingAgent",
      "contentAnalysisAgent",
      "seoAgent",
      "technicalAgent",
      "userSupportAgent",
    ];
  }

  selectAgent(message) {
    const lowerMessage = message.toLowerCase();

    // Tính điểm cho mỗi agent dựa trên số lượng từ khóa khớp
    const scores = {};

    for (const [agentName, keywords] of Object.entries(this.agentKeywords)) {
      scores[agentName] = keywords.reduce((score, keyword) => {
        return score + (lowerMessage.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
    }

    // Tìm agent có điểm cao nhất, ưu tiên specialized agents
    let bestAgent = null;
    let bestScore = 0;

    for (const agentName of this.agentPriority) {
      if (scores[agentName] > bestScore) {
        bestScore = scores[agentName];
        bestAgent = agentName;
      }
    }

    // Nếu không có từ khóa nào khớp, sử dụng defaultAgent
    if (bestScore === 0) {
      return defaultAgent;
    }

    // Return specialized agent if found
    switch (bestAgent) {
      case "accountAgent":
        return accountAgent;
      case "postManagementAgent":
        return postManagementAgent;
      case "socialAgent":
        return socialAgent;
      case "troubleshootingAgent":
        return troubleshootingAgent;
      case "performanceAgent":
        return performanceAgent;
      case "writingTipsAgent":
        return writingTipsAgent;
      case "analyticsAgent":
        return analyticsAgent;
      case "keywordAgent":
        return keywordAgent;
      case "technicalSeoAgent":
        return technicalSeoAgent;
      case "contentSeoAgent":
        return contentSeoAgent;
      case "blogWritingAgent":
        return blogWritingAgent;
      case "contentAnalysisAgent":
        return contentAnalysisAgent;
      case "seoAgent":
        return seoAgent;
      case "technicalAgent":
        return technicalAgent;
      case "userSupportAgent":
        return userSupportAgent;
      default:
        return defaultAgent;
    }
  }

  getAgentConfig(message) {
    const selectedAgent = this.selectAgent(message);
    return {
      systemPrompt: selectedAgent.systemPrompt,
      settings: selectedAgent.settings || {
        temperature: 0.5,
        max_output_tokens: 800,
        model: "gpt-4o-mini",
      },
    };
  }

  getSystemPrompt(message) {
    const selectedAgent = this.selectAgent(message);
    return selectedAgent.systemPrompt;
  }
}

module.exports = new AgentSelector();
