const topicService = require("@/services/topic.service");
const throw404 = require("@/utils/throw404");

exports.getList = async (req, res) => {
  const result = await topicService.getAll();
  if (!result) throw404();
  res.success(200, result);
};

exports.getOne = async (req, res) => {
  const { page, limit } = req.query;
  const data = await topicService.getById({
    idOrSlug: req.params.id,
    page: +page,
    limit: +limit,
    userId: req.user.id,
  });
  res.success(200, data);
};
