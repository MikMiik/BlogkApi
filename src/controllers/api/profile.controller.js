const profileService = require("@/services/profile.service");

exports.getOne = async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;
  const data = await profileService.getById({
    id: req.params.id,
    page: pageNum,
    limit: limitNum,
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

exports.searchUsers = async (req, res) => {
  const { search } = req.query;
  const data = await profileService.searchUsers(search);
  res.success(200, data);
};
