const topicService = require("@/services/topic.service");
const throw404 = require("@/utils/throw404");

exports.getList = async (req, res) => {
  const result = await topicService.getAll();
  if (!result) throw404();
  res.success(200, result);
};

exports.getOne = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;
  const data = await topicService.getById({
    idOrSlug: req.params.id,
    page: pageNum,
    limit: limitNum,
  });
  if (!data) throw404();
  res.success(200, data);
};
