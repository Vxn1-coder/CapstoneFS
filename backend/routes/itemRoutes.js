const express = require("express");
const router = express.Router();

const {
  createItem,
  getAllItems,
  getMyItems,
  claimItem,
  cancelClaim,
  resolveItem,
  deleteItem,
} = require("../controllers/itemController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/", authMiddleware, upload.single("image"), createItem);
router.get("/", authMiddleware, getAllItems);
router.get("/mine", authMiddleware, getMyItems);
router.put("/:id/claim", authMiddleware, claimItem);
router.put("/:id/cancel-claim", authMiddleware, cancelClaim);
router.put("/:id/resolve", authMiddleware, resolveItem);
router.delete("/:id", authMiddleware, deleteItem);

module.exports = router;