const postService = require("@/services/post.service");
const throw404 = require("@/utils/throw404");

exports.getList = async (req, res) => {
  const page = +req.query.page > 0 ? +req.query.page : 1;
  let limit = +req.query.limit > 0 ? +req.query.limit : 10;
  let maxLimit = 20;
  if (limit > maxLimit) limit = maxLimit;
  const data = await postService.getAll(page, limit, req.user?.id);
  if (!data) throw404();
  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const data = req.post;
  res.success(200, data);
};

exports.likeOne = async (req, res) => {
  const { postId } = req.body;
  const data = await postService.likePost({ postId, userId: req.user.id });
  res.success(200, data);
};
exports.unlikeOne = async (req, res) => {
  const { postId } = req.body;
  const data = await postService.unlikePost({ postId, userId: req.user.id });
  res.success(200, data);
};

// exports.create = async (req, res) => {
//   const post = await postService.create(req.body);
//   res.success(201, post);
// };

// exports.update = async (req, res) => {
//   const post = await postService.update(req.post.id, req.body);
//   res.success(200, post);
// };

// exports.remove = async (req, res) => {
//   await postService.remove(req.post.id);
//   res.success(204);
// };
