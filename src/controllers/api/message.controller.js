const pusher = require("@/configs/pusher");
const messageService = require("@/services/message.service");
const throw404 = require("@/utils/throw404");

exports.getAllConversations = async (req, res) => {
  const data = await messageService.getAllConversations();
  if (!data) throw404();
  res.success(200, data);
};

exports.getConversation = async (req, res) => {
  const { id } = req.params;

  const data = await messageService.getConversationMessages({
    conversationId: id,
  });
  if (!data) throw404();
  res.success(200, data);
};

exports.send = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const data = await messageService.create(req.body);
    await pusher.trigger(`conversation-${conversationId}`, "new-message", {
      data,
    });
    res.success(200);
  } catch (error) {
    console.error("Pusher trigger error:", error);
    res.error(500, "Failed to send message");
  }
};

exports.create = async (req, res) => {
  const data = await messageService.create(req.body);
  res.success(200, data);
};
