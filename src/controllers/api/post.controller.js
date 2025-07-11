const postService = require("@/services/post.service");
const throw404 = require("@/utils/throw404");

exports.getList = async (req, res) => {
  const page = +req.query.page > 0 ? +req.query.page : 1;
  let limit = +req.query.limit > 0 ? +req.query.limit : 10;
  let maxLimit = 20;
  if (limit > maxLimit) limit = maxLimit;
  const result = await postService.getAll(page, limit);
  if (!result) throw404();
  res.success(200, result);
};

exports.getOne = async (req, res) => {
  const data = {
    ...req.post.dataValues,
  };
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
