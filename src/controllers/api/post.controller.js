const postService = require("@/services/post.service");

exports.getList = async (req, res) => {
  const { limit, page } = req.query;
  const data = await postService.getAll(+page, +limit);
  res.success(200, data);
};

exports.getBookmarkList = async (req, res) => {
  const { limit, page } = req.query;
  const data = await postService.getBookmarkPosts(+page, +limit);
  res.success(200, data);
};

exports.getOwnList = async (req, res) => {
  const data = await postService.getOwnPosts();
  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const data = await postService.getById(id);
  res.success(200, data);
};

exports.getToEdit = async (req, res) => {
  const { id } = req.params;
  const data = await postService.getPostToEdit(id);
  res.success(200, data);
};

exports.likeOne = async (req, res) => {
  const { postId } = req.body;
  const data = await postService.likePost(postId);
  res.success(200, data);
};

exports.unlikeOne = async (req, res) => {
  const { postId } = req.body;
  const data = await postService.unlikePost(postId);
  res.success(200, data);
};

exports.bookmarkOne = async (req, res) => {
  const { postId } = req.body;
  const data = await postService.bookmarkPost(postId);
  res.success(200, data);
};

exports.unBookmarkOne = async (req, res) => {
  const { postId } = req.body;
  const data = await postService.unBookmarkPost(postId);
  res.success(200, data);
};

exports.draft = async (req, res) => {
  const postId = req.body.postId;
  if (postId) {
    await postService.update(postId, req.body);
    return res.success(201, { postId });
  }
  const data = await postService.create({ ...req.body, userId: req.user.id });
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
