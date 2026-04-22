const Chat = require("../models/Chat");

exports.startChat = async (req, res) => {
  try {
    const { otherUserId, itemId, currentUserId } = req.body;

    let chat = await Chat.findOne({
      users: { $all: [currentUserId, otherUserId] },
      item: itemId,
    });

    if (!chat) {
      chat = await Chat.create({
        users: [currentUserId, otherUserId],
        item: itemId,
      });
    }

    res.json({ chatId: chat._id });
  } catch (err) {
    res.status(500).json({ message: "Chat error" });
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: req.params.userId,
    })
      .populate("users", "name")
      .populate("item", "title");

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Fetch chat error" });
  }
};