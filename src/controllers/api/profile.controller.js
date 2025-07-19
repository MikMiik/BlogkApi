const profileService = require("@/services/profile.service");

exports.getOne = async (req, res) => {
  const page = +req.query.page > 0 ? +req.query.page : 1;
  let limit = +req.query.limit > 0 ? +req.query.limit : 10;
  let maxLimit = 20;
  if (limit > maxLimit) limit = maxLimit;
  const data = await profileService.getById(req.params.id, +page, +limit);
  res.success(200, data);
};
