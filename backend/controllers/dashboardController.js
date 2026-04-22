const Item = require("../models/Item");

exports.getDashboard = async (req, res) => {
  try {
    const totalReports = await Item.countDocuments();
    const lostItems = await Item.countDocuments({ type: "lost" });
    const foundItems = await Item.countDocuments({ type: "found" });

    res.json({
      totalReports,
      lostItems,
      foundItems,
      openCases: totalReports - foundItems,
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard error" });
  }
};