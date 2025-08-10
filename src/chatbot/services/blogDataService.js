const { Post, User, Category, Tag, Comment } = require("@/models");
const { Op } = require("sequelize");

class BlogDataService {
  constructor() {
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    this.cache = new Map();
  }

  // Caching helper
  getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  async getCachedData(cacheKey, dataFetcher) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await dataFetcher();
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  // Search posts by various criteria
  async searchPosts(query, options = {}) {
    const {
      limit = 10,
      offset = 0,
      authorId = null,
      categoryId = null,
      includeDrafts = false,
    } = options;

    const cacheKey = this.getCacheKey("searchPosts", { query, options });

    return await this.getCachedData(cacheKey, async () => {
      const whereConditions = {
        status: includeDrafts
          ? { [Op.in]: ["published", "draft"] }
          : "published",
      };

      if (query) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${query}%` } },
          { content: { [Op.iLike]: `%${query}%` } },
          { excerpt: { [Op.iLike]: `%${query}%` } },
        ];
      }

      if (authorId) {
        whereConditions.authorId = authorId;
      }

      if (categoryId) {
        whereConditions.categoryId = categoryId;
      }

      const posts = await Post.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "username", "avatar"],
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
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return posts;
    });
  }

  // Find posts by exact title match
  async findPostByTitle(title, fuzzy = true) {
    const cacheKey = this.getCacheKey("findPostByTitle", { title, fuzzy });

    return await this.getCachedData(cacheKey, async () => {
      const whereCondition = fuzzy
        ? { title: { [Op.iLike]: `%${title}%` } }
        : { title: title };

      const post = await Post.findOne({
        where: {
          ...whereCondition,
          status: "published",
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "username", "avatar", "bio"],
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug", "description"],
          },
          {
            model: Tag,
            as: "tags",
            attributes: ["id", "name", "slug"],
            through: { attributes: [] },
          },
        ],
      });

      return post;
    });
  }

  // Get author information and their posts
  async findAuthorInfo(authorIdentifier) {
    const cacheKey = this.getCacheKey("findAuthorInfo", { authorIdentifier });

    return await this.getCachedData(cacheKey, async () => {
      const author = await User.findOne({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${authorIdentifier}%` } },
            { username: { [Op.iLike]: `%${authorIdentifier}%` } },
            { email: { [Op.iLike]: `%${authorIdentifier}%` } },
          ],
        },
        attributes: ["id", "name", "username", "avatar", "bio", "createdAt"],
      });

      if (!author) return null;

      const [posts, totalPosts] = await Promise.all([
        Post.findAll({
          where: {
            authorId: author.id,
            status: "published",
          },
          attributes: ["id", "title", "slug", "excerpt", "createdAt"],
          order: [["createdAt", "DESC"]],
          limit: 10,
        }),
        Post.count({
          where: {
            authorId: author.id,
            status: "published",
          },
        }),
      ]);

      return {
        author: author.toJSON(),
        posts,
        totalPosts,
      };
    });
  }

  // Get posts by category
  async getPostsByCategory(categoryIdentifier, limit = 10) {
    const cacheKey = this.getCacheKey("getPostsByCategory", {
      categoryIdentifier,
      limit,
    });

    return await this.getCachedData(cacheKey, async () => {
      const category = await Category.findOne({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${categoryIdentifier}%` } },
            { slug: { [Op.iLike]: `%${categoryIdentifier}%` } },
          ],
        },
      });

      if (!category) return null;

      const posts = await Post.findAll({
        where: {
          categoryId: category.id,
          status: "published",
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "username", "avatar"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
      });

      return {
        category,
        posts,
      };
    });
  }

  // Get posts by tag
  async getPostsByTag(tagName, limit = 10) {
    const cacheKey = this.getCacheKey("getPostsByTag", { tagName, limit });

    return await this.getCachedData(cacheKey, async () => {
      const tag = await Tag.findOne({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${tagName}%` } },
            { slug: { [Op.iLike]: `%${tagName}%` } },
          ],
        },
      });

      if (!tag) return null;

      const posts = await Post.findAll({
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "username", "avatar"],
          },
          {
            model: Tag,
            as: "tags",
            where: { id: tag.id },
            through: { attributes: [] },
          },
        ],
        where: {
          status: "published",
        },
        order: [["createdAt", "DESC"]],
        limit,
      });

      return {
        tag,
        posts,
      };
    });
  }

  // Get recent posts
  async getRecentPosts(limit = 5) {
    const cacheKey = this.getCacheKey("getRecentPosts", { limit });

    return await this.getCachedData(cacheKey, async () => {
      const posts = await Post.findAll({
        where: {
          status: "published",
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "username", "avatar"],
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
      });

      return posts;
    });
  }

  // Get popular posts (by comments or views if available)
  async getPopularPosts(limit = 5, days = 7) {
    const cacheKey = this.getCacheKey("getPopularPosts", { limit, days });

    return await this.getCachedData(cacheKey, async () => {
      const dateLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const posts = await Post.findAll({
        where: {
          status: "published",
          createdAt: {
            [Op.gte]: dateLimit,
          },
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name", "username", "avatar"],
          },
          {
            model: Comment,
            as: "comments",
            attributes: ["id"],
            required: false,
          },
        ],
        order: [
          // Order by comment count (most commented first)
          [{ model: Comment, as: "comments" }, "id", "DESC"],
        ],
        limit,
        subQuery: false,
        group: ["Post.id", "author.id"],
      });

      return posts;
    });
  }

  // Get blog statistics
  async getBlogStats() {
    const cacheKey = this.getCacheKey("getBlogStats", {});

    return await this.getCachedData(cacheKey, async () => {
      const [
        totalPosts,
        totalAuthors,
        totalCategories,
        totalTags,
        totalComments,
        publishedPosts,
        draftPosts,
      ] = await Promise.all([
        Post.count(),
        User.count(),
        Category.count(),
        Tag.count(),
        Comment.count(),
        Post.count({ where: { status: "published" } }),
        Post.count({ where: { status: "draft" } }),
      ]);

      return {
        totalPosts,
        totalAuthors,
        totalCategories,
        totalTags,
        totalComments,
        publishedPosts,
        draftPosts,
      };
    });
  }

  // Advanced search with multiple filters
  async advancedSearch(filters = {}) {
    const {
      query = "",
      authorName = "",
      categoryName = "",
      tagNames = [],
      dateFrom = null,
      dateTo = null,
      status = "published",
      limit = 10,
      offset = 0,
    } = filters;

    const cacheKey = this.getCacheKey("advancedSearch", filters);

    return await this.getCachedData(cacheKey, async () => {
      const whereConditions = {
        status,
      };

      // Text search
      if (query) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${query}%` } },
          { content: { [Op.iLike]: `%${query}%` } },
          { excerpt: { [Op.iLike]: `%${query}%` } },
        ];
      }

      // Date range
      if (dateFrom || dateTo) {
        whereConditions.createdAt = {};
        if (dateFrom) whereConditions.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) whereConditions.createdAt[Op.lte] = new Date(dateTo);
      }

      const include = [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "username", "avatar"],
          where: authorName
            ? {
                [Op.or]: [
                  { name: { [Op.iLike]: `%${authorName}%` } },
                  { username: { [Op.iLike]: `%${authorName}%` } },
                ],
              }
            : undefined,
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
          where: categoryName
            ? {
                name: { [Op.iLike]: `%${categoryName}%` },
              }
            : undefined,
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name", "slug"],
          through: { attributes: [] },
          where:
            tagNames.length > 0
              ? {
                  name: { [Op.in]: tagNames },
                }
              : undefined,
        },
      ];

      const posts = await Post.findAndCountAll({
        where: whereConditions,
        include,
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        distinct: true,
      });

      return posts;
    });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Clear specific cache entries
  clearCacheByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = new BlogDataService();
