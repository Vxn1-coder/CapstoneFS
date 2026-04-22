const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  startChat,
  sendMessage,
  getMessages,
  getMyChats,
} = require("../controllers/messageController");

router.get("/chats", authMiddleware, getMyChats);
router.get("/:chatId", authMiddleware, getMessages);
router.post("/start", authMiddleware, startChat);
router.post("/", authMiddleware, sendMessage);

module.exports = router;