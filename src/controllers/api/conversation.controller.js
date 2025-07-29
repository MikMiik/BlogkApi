const conversationService = require("@/services/conversation.service");
const throw404 = require("@/utils/throw404");

exports.getList = async (req, res) => {
  const result = await conversationService.getAllConversations();
  if (!result) throw404();
  res.success(200, result);
};
