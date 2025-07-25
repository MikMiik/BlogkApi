const userService = require("@/services/user.service");
const throw404 = require("@/utils/throw404");

exports.getList = async (req, res) => {
  const result = await userService.getAll();
  if (!result) throw404();
  res.success(200, result);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const data = await userService.getById(id);
  res.success(200, data);
};

exports.create = async (req, res) => {
  const user = await userService.create(req.body);
  res.success(201, user);
};

exports.update = async (req, res) => {
  const user = await userService.update(req.user.id, req.body);
  res.success(200, user);
};

exports.remove = async (req, res) => {
  await userService.remove(req.user.id);
  res.success(204);
};
