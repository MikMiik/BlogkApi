const messageService = require("@/services/message.service");
const throw404 = require("@/utils/throw404");

exports.getConversationMessages = async (req, res) => {
  const { conversationId } = req.query;
  const data = await messageService.getConversationMessages(conversationId);
  if (!data) throw404();
  res.success(200, data);
};

exports.send = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const message = await messageService.create({ conversationId, content });

    res.success(200, message);
  } catch (error) {
    console.error("Pusher trigger error:", error);
    res.error(500, "Failed to send message");
  }
};
