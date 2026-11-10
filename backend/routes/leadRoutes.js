
const express = require("express");
const Lead = require("../models/Lead");

const router = express.Router();

// GET ALL LEADS
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      leads,
    });
  } catch (error) {
    console.error("Fetch Leads Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch leads.",
    });
  }
});

// ADD NEW LEAD
router.post("/", async (req, res) => {
  try {
    const { name, mobile, email, address, notes } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof mobile !== "string" ||
      !mobile.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Lead name and mobile number are required.",
      });
    }

    const lead = await Lead.create({
      name,
      mobile,
      email,
      address,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Lead added successfully.",
      lead,
    });
  } catch (error) {
    console.error("Add Lead Error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Could not add lead.",
    });
  }
});

module.exports = router;
