const { Post, User, Category, Tag } = require("@/models");
const { Op } = require("sequelize");
const blogDataService = require("../../services/blogDataService");

class BlogDataAgent {
  constructor() {
    this.name = "BlogDataAgent";
    this.description = "Handles queries about blog posts, authors, and content";
    this.keywords = [
      "tác giả",
      "author",
      "người viết",
      "ai viết",
      "bài viết",
      "post",
      "blog",
      "tiêu đề",
      "title",
      "nội dung",
      "content",
      "category",
      "danh mục",
      "tag",
      "thẻ",
      "bài",
      "article",
      "published",
      "xuất bản",
    ];
  }

  async handle(message, context = {}) {
    try {
      // Phân tích câu hỏi để xác định loại truy vấn
      const queryType = this.analyzeQuery(message);

      switch (queryType.type) {
        case "author_by_title":
          return await this.findAuthorByTitle(queryType.title);
        case "posts_by_author":
          return await this.findPostsByAuthor(queryType.author);
        case "post_details":
          return await this.getPostDetails(queryType.title);
        case "recent_posts":
          return await this.getRecentPosts(queryType.limit || 5);
        case "posts_by_category":
          return await this.getPostsByCategory(queryType.category);
        case "search_posts":
          return await this.searchPosts(queryType.searchTerm);
        default:
          return await this.getGeneralBlogInfo();
      }
    } catch (error) {
      console.error("BlogDataAgent error:", error);
      return {
        success: false,
        message:
          "Xin lỗi, tôi không thể truy xuất thông tin blog lúc này. Vui lòng thử lại sau.",
        shouldContinue: false,
      };
    }
  }

  analyzeQuery(message) {
    const lowerMessage = message.toLowerCase();

    // Tìm tác giả theo tiêu đề bài viết
    const titleMatch = lowerMessage.match(
      /(?:tác giả|author|ai viết|người viết).*?(?:bài|post|title|tiêu đề).*?"([^"]+)"/
    );
    if (titleMatch) {
      return { type: "author_by_title", title: titleMatch[1] };
    }

    // Tìm tác giả của bài có tiêu đề cụ thể (không có dấu ngoặc kép)
    const titleMatch2 = lowerMessage.match(
      /(?:tác giả|author|ai viết|người viết).*?(?:bài|post|title|tiêu đề).*?(?:có|là|của)\s*(.+?)(?:\s|$)/
    );
    if (titleMatch2) {
      return { type: "author_by_title", title: titleMatch2[1].trim() };
    }

    // Tìm bài viết theo tác giả
    const authorMatch = lowerMessage.match(
      /(?:bài viết|post|article).*?(?:của|by|tác giả)\s*([^?.,!]+)/
    );
    if (authorMatch) {
      return { type: "posts_by_author", author: authorMatch[1].trim() };
    }

    // Chi tiết bài viết
    if (
      lowerMessage.includes("chi tiết") ||
      lowerMessage.includes("thông tin")
    ) {
      const titleMatch = lowerMessage.match(/"([^"]+)"/);
      if (titleMatch) {
        return { type: "post_details", title: titleMatch[1] };
      }
    }

    // Bài viết mới nhất
    if (
      lowerMessage.includes("mới nhất") ||
      lowerMessage.includes("recent") ||
      lowerMessage.includes("latest")
    ) {
      const limitMatch = lowerMessage.match(/(\d+)/);
      return {
        type: "recent_posts",
        limit: limitMatch ? parseInt(limitMatch[1]) : 5,
      };
    }

    // Tìm theo category
    const categoryMatch = lowerMessage.match(
      /(?:danh mục|category|chủ đề)\s*([^?.,!]+)/
    );
    if (categoryMatch) {
      return { type: "posts_by_category", category: categoryMatch[1].trim() };
    }

    // Tìm kiếm general
    if (lowerMessage.includes("tìm") || lowerMessage.includes("search")) {
      return { type: "search_posts", searchTerm: message };
    }

    return { type: "general" };
  }

  async findAuthorByTitle(title) {
    try {
      const post = await blogDataService.findPostByTitle(title, true);

      if (!post) {
        return {
          success: false,
          message: `Tôi không tìm thấy bài viết có tiêu đề "${title}". Có thể bạn kiểm tra lại tên chính xác hoặc tôi có thể tìm các bài viết tương tự?`,
          shouldContinue: false,
        };
      }

      return {
        success: true,
        message: `Bài viết **"${post.title}"** được viết bởi **${post.author.name}** (username: @${post.author.username}).\n\nBạn có muốn biết thêm thông tin về bài viết này hoặc các bài viết khác của tác giả không?`,
        data: {
          post: {
            id: post.id,
            title: post.title,
            slug: post.slug,
          },
          author: {
            id: post.author.id,
            name: post.author.name,
            username: post.author.username,
          },
        },
        shouldContinue: false,
      };
    } catch (error) {
      console.error("Error finding author by title:", error);
      throw error;
    }
  }

  async findPostsByAuthor(authorName) {
    try {
      const posts = await Post.findAll({
        include: [
          {
            model: User,
            as: "author",
            where: {
              [Op.or]: [
                { name: { [Op.iLike]: `%${authorName}%` } },
                { username: { [Op.iLike]: `%${authorName}%` } },
              ],
            },
            attributes: ["id", "name", "username"],
          },
        ],
        where: {
          status: "published",
        },
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      if (posts.length === 0) {
        return {
          success: false,
          message: `Tôi không tìm thấy bài viết nào của tác giả "${authorName}". Có thể bạn kiểm tra lại tên tác giả?`,
          shouldContinue: false,
        };
      }

      const authorInfo = posts[0].author;
      const postList = posts.map((post) => `• **${post.title}**`).join("\n");

      return {
        success: true,
        message: `Tác giả **${authorInfo.name}** (@${authorInfo.username}) đã viết ${posts.length} bài viết:\n\n${postList}\n\nBạn muốn xem chi tiết bài viết nào không?`,
        data: {
          author: {
            id: authorInfo.id,
            name: authorInfo.name,
            username: authorInfo.username,
          },
          posts: posts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
          })),
        },
        shouldContinue: false,
      };
    } catch (error) {
      console.error("Error finding posts by author:", error);
      throw error;
    }
  }

  async getPostDetails(title) {
    try {
      const post = await Post.findOne({
        where: {
          title: {
            [Op.iLike]: `%${title}%`,
          },
          status: "published",
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "username"],
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug"],
          },
          {
            model: Tag,
            as: "tags",
            attributes: ["id", "name", "slug"],
            through: { attributes: [] },
          },
        ],
      });

      if (!post) {
        return {
          success: false,
          message: `Tôi không tìm thấy bài viết "${title}".`,
          shouldContinue: false,
        };
      }

      const tags = post.tags.map((tag) => tag.name).join(", ");
      const excerpt = post.excerpt || post.content.substring(0, 200) + "...";

      return {
        success: true,
        message: `**${post.title}**\n\n**Tác giả:** ${post.author.name} (@${post.author.username})\n**Danh mục:** ${post.category.name}\n**Tags:** ${tags}\n**Ngày xuất bản:** ${new Date(post.createdAt).toLocaleDateString("vi-VN")}\n\n**Tóm tắt:** ${excerpt}\n\nBạn có muốn biết thêm thông tin gì về bài viết này không?`,
        data: {
          post: {
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            createdAt: post.createdAt,
          },
          author: post.author,
          category: post.category,
          tags: post.tags,
        },
        shouldContinue: false,
      };
    } catch (error) {
      console.error("Error getting post details:", error);
      throw error;
    }
  }

  async getRecentPosts(limit = 5) {
    try {
      const posts = await Post.findAll({
        where: {
          status: "published",
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "username"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: Math.min(limit, 10),
      });

      if (posts.length === 0) {
        return {
          success: false,
          message: "Hiện tại chưa có bài viết nào được xuất bản.",
          shouldContinue: false,
        };
      }

      const postList = posts
        .map(
          (post) =>
            `• **${post.title}** - *${post.author.name}* (${new Date(post.createdAt).toLocaleDateString("vi-VN")})`
        )
        .join("\n");

      return {
        success: true,
        message: `Đây là ${posts.length} bài viết mới nhất:\n\n${postList}\n\nBạn muốn xem chi tiết bài viết nào không?`,
        data: {
          posts: posts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            author: post.author,
            createdAt: post.createdAt,
          })),
        },
        shouldContinue: false,
      };
    } catch (error) {
      console.error("Error getting recent posts:", error);
      throw error;
    }
  }

  async getPostsByCategory(categoryName) {
    try {
      const posts = await Post.findAll({
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "username"],
          },
          {
            model: Category,
            as: "category",
            where: {
              name: {
                [Op.iLike]: `%${categoryName}%`,
              },
            },
            attributes: ["id", "name", "slug"],
          },
        ],
        where: {
          status: "published",
        },
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      if (posts.length === 0) {
        return {
          success: false,
          message: `Tôi không tìm thấy bài viết nào trong danh mục "${categoryName}".`,
          shouldContinue: false,
        };
      }

      const categoryInfo = posts[0].category;
      const postList = posts
        .map((post) => `• **${post.title}** - *${post.author.name}*`)
        .join("\n");

      return {
        success: true,
        message: `Danh mục **${categoryInfo.name}** có ${posts.length} bài viết:\n\n${postList}\n\nBạn muốn xem chi tiết bài viết nào không?`,
        data: {
          category: categoryInfo,
          posts: posts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            author: post.author,
          })),
        },
        shouldContinue: false,
      };
    } catch (error) {
      console.error("Error getting posts by category:", error);
      throw error;
    }
  }

  async searchPosts(searchTerm) {
    try {
      const posts = await Post.findAll({
        where: {
          [Op.and]: [
            { status: "published" },
            {
              [Op.or]: [
                { title: { [Op.iLike]: `%${searchTerm}%` } },
                { content: { [Op.iLike]: `%${searchTerm}%` } },
                { excerpt: { [Op.iLike]: `%${searchTerm}%` } },
              ],
            },
          ],
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "username"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 8,
      });

      if (posts.length === 0) {
        return {
          success: false,
          message: `Tôi không tìm thấy bài viết nào phù hợp với "${searchTerm}".`,
          shouldContinue: false,
        };
      }

      const postList = posts
        .map((post) => `• **${post.title}** - *${post.author.name}*`)
        .join("\n");

      return {
        success: true,
        message: `Tìm thấy ${posts.length} bài viết phù hợp với "${searchTerm}":\n\n${postList}\n\nBạn muốn xem chi tiết bài viết nào không?`,
        data: {
          searchTerm,
          posts: posts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            author: post.author,
          })),
        },
        shouldContinue: false,
      };
    } catch (error) {
      console.error("Error searching posts:", error);
      throw error;
    }
  }

  async getGeneralBlogInfo() {
    try {
      const [totalPosts, totalAuthors, recentPosts] = await Promise.all([
        Post.count({ where: { status: "published" } }),
        User.count(),
        Post.findAll({
          where: { status: "published" },
          include: [{ model: User, as: "author", attributes: ["name"] }],
          order: [["createdAt", "DESC"]],
          limit: 3,
        }),
      ]);

      const recentList = recentPosts
        .map((post) => `• ${post.title} - *${post.author.name}*`)
        .join("\n");

      return {
        success: true,
        message: `**Thông tin Blog:**\n\n📝 Tổng số bài viết: ${totalPosts}\n👥 Tổng số tác giả: ${totalAuthors}\n\n**Bài viết mới nhất:**\n${recentList}\n\nTôi có thể giúp bạn tìm kiếm bài viết, tác giả, hoặc thông tin cụ thể nào khác không?`,
        data: {
          totalPosts,
          totalAuthors,
          recentPosts: recentPosts.map((post) => ({
            title: post.title,
            author: post.author.name,
          })),
        },
        shouldContinue: false,
      };
    } catch (error) {
      console.error("Error getting general blog info:", error);
      throw error;
    }
  }
}

module.exports = BlogDataAgent;
