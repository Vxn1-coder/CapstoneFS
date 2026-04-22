const Message = require("../models/Message");

exports.startChat = async (req, res) => {
  try {
    const { otherUserId, itemId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required" });
    }

    if (String(otherUserId) === String(req.user.id)) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    const userA = String(req.user.id);
    const userB = String(otherUserId);
    const sortedUsers = [userA, userB].sort();

    const chatId = itemId
      ? `${sortedUsers[0]}_${sortedUsers[1]}_${itemId}`
      : `${sortedUsers[0]}_${sortedUsers[1]}`;

    const existingMessages = await Message.find({ chatId })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      chatId,
      itemId: itemId || null,
      messages: existingMessages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to start chat",
      error: error.message,
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, receiver, text, itemId } = req.body;

    if (!chatId || !receiver || !text?.trim()) {
      return res.status(400).json({
        message: "chatId, receiver and text are required",
      });
    }

    const message = await Message.create({
      chatId,
      sender: req.user.id,
      receiver,
      text: text.trim(),
      itemId: itemId || null,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

exports.getMyChats = async (req, res) => {
  try {
    const userId = String(req.user.id);

    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    const chatMap = new Map();

    for (const msg of messages) {
      if (!chatMap.has(msg.chatId)) {
        const senderId = String(msg.sender?._id || msg.sender);
        const otherUser = senderId === userId ? msg.receiver : msg.sender;

        chatMap.set(msg.chatId, {
          chatId: msg.chatId,
          itemId: msg.itemId || null,
          otherUser,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
        });
      }
    }

    res.status(200).json(Array.from(chatMap.values()));
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch chats",
      error: error.message,
    });
  }
};