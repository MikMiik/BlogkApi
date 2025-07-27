const profileService = require("@/services/profile.service");

exports.getOne = async (req, res) => {
  const { limit, page } = req.query;
  const data = await profileService.getById({
    id: req.params.id,
    page: +page,
    limit: +limit,
  });
  res.success(200, data);
};
exports.getOneToEdit = async (req, res) => {
  const data = await profileService.getToEdit({
    id: req.params.id || req.params.username,
  });
  res.success(200, data);
};
exports.follow = async (req, res) => {
  const { username } = req.params;

  const data = await profileService.follow(username);
  res.success(200, data);
};
exports.unfollow = async (req, res) => {
  const { username } = req.params;
  const data = await profileService.unfollow(username);
  res.success(200, data);
};

exports.update = async (req, res) => {
  const result = await profileService.editProfile({
    data: req.body,
    files: req.files,
  });
  res.success(200, result);
};
