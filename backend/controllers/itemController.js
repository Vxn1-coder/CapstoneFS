const Item = require("../models/Item");

exports.createItem = async (req, res) => {
  try {
    const { title, description, category, type, location, date } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const item = await Item.create({
      title,
      description,
      category,
      type,
      location,
      date,
      image,
      user: req.user.id,
      status: "open",
      claimedBy: null,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create item",
      error: error.message,
    });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("user", "name email")
      .populate("claimedBy", "name email")
      .sort({ createdAt: -1 });

    const totalReports = await Item.countDocuments({});
    const lostItems = await Item.countDocuments({ type: "lost" });
    const foundItems = await Item.countDocuments({ type: "found" });
    const openCases = await Item.countDocuments({
      status: { $in: ["open", "claimed"] },
    });

    res.status(200).json({
      items,
      stats: {
        totalReports,
        lostItems,
        foundItems,
        openCases,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch items",
      error: error.message,
    });
  }
};

exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.id })
      .populate("user", "name email")
      .populate("claimedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user items",
      error: error.message,
    });
  }
};

exports.claimItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.status === "resolved") {
      return res.status(400).json({ message: "This case is already resolved" });
    }

    if (String(item.user) === String(req.user.id)) {
      return res.status(400).json({ message: "You cannot claim your own item" });
    }

    if (item.claimedBy) {
      return res.status(400).json({ message: "This item is already claimed" });
    }

    item.claimedBy = req.user.id;
    item.status = "claimed";
    await item.save();

    const updatedItem = await Item.findById(item._id)
      .populate("user", "name email")
      .populate("claimedBy", "name email");

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({
      message: "Failed to claim item",
      error: error.message,
    });
  }
};

exports.cancelClaim = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.status !== "claimed" || !item.claimedBy) {
      return res.status(400).json({ message: "This item has no active claim" });
    }

    const isOwner = String(item.user) === String(req.user.id);
    const isClaimer = String(item.claimedBy) === String(req.user.id);

    if (!isOwner && !isClaimer) {
      return res.status(403).json({ message: "You are not allowed to cancel this claim" });
    }

    item.claimedBy = null;
    item.status = "open";
    await item.save();

    const updatedItem = await Item.findById(item._id)
      .populate("user", "name email")
      .populate("claimedBy", "name email");

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel claim",
      error: error.message,
    });
  }
};

exports.resolveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.status !== "claimed") {
      return res.status(400).json({ message: "Only claimed items can be closed" });
    }

    const isOwner = String(item.user) === String(req.user.id);
    const isClaimer = item.claimedBy && String(item.claimedBy) === String(req.user.id);

    if (!isOwner && !isClaimer) {
      return res.status(403).json({ message: "You are not allowed to close this case" });
    }

    item.status = "resolved";
    await item.save();

    const updatedItem = await Item.findById(item._id)
      .populate("user", "name email")
      .populate("claimedBy", "name email");

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({
      message: "Failed to resolve item",
      error: error.message,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (String(item.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the owner can delete this item" });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message,
    });
  }
};