const conversationService = require("@/services/conversation.service");
const throw404 = require("@/utils/throw404");

exports.getList = async (req, res) => {
  const result = await conversationService.getAllConversations();
  if (!result) throw404();
  res.success(200, result);
};

exports.getShared = async (req, res) => {
  const { otherId } = req.params;

  if (!otherId) throw404("Other user ID is required");
  const result = await conversationService.getSharedConversation(+otherId);
  res.success(200, result);
};

exports.markRead = async (req, res) => {
  const { id: conversationId } = req.params;
  if (!conversationId) throw404("Conversation ID is required");
  await conversationService.markRead(conversationId);
  res.success(200, { message: "Conversation marked as read" });
};
