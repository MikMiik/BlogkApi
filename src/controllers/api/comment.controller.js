const commentService = require("@/services/comment.service");
const throw404 = require("@/utils/throw404");

exports.getList = async (req, res) => {
  const result = await commentService.getAll();
  if (!result) throw404();
  res.success(200, result);
};

exports.getOne = async (req, res) => {
  const data = req.comment;
  res.success(200, data);
};

exports.create = async (req, res) => {
  const comment = await commentService.create(req.body);
  res.success(201, comment);
};

exports.update = async (req, res) => {
  const comment = await commentService.update(req.comment.id, req.body);
  res.success(200, comment);
};

exports.remove = async (req, res) => {
  await commentService.remove(req.comment.id);
  res.success(204);
};
