const pusher = require("@/configs/pusher");
const messageService = require("@/services/message.service");
const throw404 = require("@/utils/throw404");

exports.getConversation = async (req, res) => {
  const { conversationId } = req.query;
  const data = await messageService.getConversationMessages({ conversationId });
  if (!data) throw404();
  res.success(200, data);
};
exports.send = async (req, res) => {
  try {
    await pusher.trigger("k12", "new-message", {
      message: req.body.message,
    });
    res.success(200);
  } catch (error) {
    console.error("Pusher trigger error:", error);
    res.error(500, "Failed to send message");
  }
};
