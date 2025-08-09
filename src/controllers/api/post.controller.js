const postService = require("@/services/post.service");
const redisClient = require("@/configs/redis");

exports.getList = async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;
  const data = await postService.getAll(pageNum, limitNum);
  res.success(200, data);
};

exports.getBookmarkList = async (req, res) => {
  const data = await postService.getBookmarkPosts();
  res.success(200, data);
};

exports.getOwnList = async (req, res) => {
  const data = await postService.getOwnPosts();
  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const data = await postService.getById(id);

  // Database is the source of truth for view count
  // Only use Redis for fast increment, but always show database count
  if (data.post) {
    try {
      // Always use database view count as the authoritative source
      // Redis is only used for fast increments and periodic sync

      // Add view tracking info to response
      data.isNewView = req.isNewView || false;

      console.log(
        `📊 Showing view count from database: ${data.post.viewsCount} for post ${id}`
      );
    } catch (error) {
      console.error("❌ Error in view count logic:", error.message);
    }
  }

  res.success(200, data);
};

exports.getToEdit = async (req, res) => {
  const { id } = req.params;
  const data = await postService.getPostToEdit(id);
  res.success(200, data);
};

exports.likeOne = async (req, res) => {
  const { id } = req.params;
  const data = await postService.likePost(id);
  res.success(200, data);
};

exports.unlikeOne = async (req, res) => {
  const { id } = req.params;
  const data = await postService.unlikePost(id);
  res.success(200, data);
};

exports.bookmarkOne = async (req, res) => {
  const { id } = req.params;
  const data = await postService.bookmarkPost(id);
  res.success(200, data);
};

exports.unBookmarkOne = async (req, res) => {
  const { id } = req.params;
  const data = await postService.unBookmarkPost(id);
  res.success(200, data);
};

exports.clearBookmarks = async (req, res) => {
  const data = await postService.clearBookmarks();
  res.success(200, data);
};

exports.draft = async (req, res) => {
  const data = await postService.create(req.body);
  res.success(201, data);
};

exports.publish = async (req, res) => {
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }
  const data = await postService.publishPost(req.body);
  res.success(201, data);
};

exports.edit = async (req, res) => {
  const { id } = req.params;
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }
  const data = await postService.editPost(id, req.body);
  res.success(200, data);
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  await postService.remove(id);
  res.success(204);
};

exports.searchPosts = async (req, res) => {
  const { search } = req.query;

  const data = await postService.searchPosts(search);
  res.success(200, data);
};
