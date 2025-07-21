const profileService = require("@/services/profile.service");

exports.getOne = async (req, res) => {
  const page = +req.query.page > 0 ? +req.query.page : 1;
  let limit = +req.query.limit > 0 ? +req.query.limit : 10;
  let maxLimit = 20;
  if (limit > maxLimit) limit = maxLimit;
  const data = await profileService.getById({
    id: req.params.id,
    page: +page,
    limit: +limit,
    userId: req.user.id,
  });
  res.success(200, data);
};
exports.getOneToEdit = async (req, res) => {
  const data = await profileService.getToEdit({
    id: req.params.id || req.params.username,
  });
  res.success(200, data);
};

exports.update = async (req, res) => {
  const result = await profileService.editProfile({
    userId: req.user.id,
    data: req.body,
    files: req.files,
  });
  res.success(200, result);
};
