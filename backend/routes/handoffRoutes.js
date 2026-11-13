
const express = require("express");
const mongoose = require("mongoose");
const HandoffRequest = require("../models/HandoffRequest");

const router = express.Router();

// GET ALL HANDOFF REQUESTS
// GET /api/handoffs
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (
      status &&
      ["pending", "assigned", "completed"].includes(status)
    ) {
      filter.status = status;
    }

    const requests = await HandoffRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const counts = await HandoffRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = {
      pending: 0,
      assigned: 0,
      completed: 0,
    };

    counts.forEach((item) => {
      summary[item._id] = item.count;
    });

    return res.json({
      success: true,
      requests,
      summary,
    });
  } catch (error) {
    console.error("Fetch Handoffs Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch handoff requests.",
    });
  }
});

// GET SINGLE HANDOFF REQUEST
// GET /api/handoffs/:id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid handoff ID.",
      });
    }

    const request = await HandoffRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Handoff request not found.",
      });
    }

    return res.json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Handoff Details Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch handoff details.",
    });
  }
});

// UPDATE HANDOFF REQUEST
// PATCH /api/handoffs/:id
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid handoff ID.",
      });
    }

    const { status, assignedTo, notes } = req.body;
    const updateData = {};

    if (status !== undefined) {
      if (
        !["pending", "assigned", "completed"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid handoff status.",
        });
      }

      updateData.status = status;
    }

    if (assignedTo !== undefined) {
      if (typeof assignedTo !== "string") {
        return res.status(400).json({
          success: false,
          message: "Assigned person must be text.",
        });
      }

      updateData.assignedTo = assignedTo.trim().slice(0, 100);
    }

    if (notes !== undefined) {
      if (typeof notes !== "string") {
        return res.status(400).json({
          success: false,
          message: "Notes must be text.",
        });
      }

      updateData.notes = notes.trim().slice(0, 2000);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    if (
      updateData.status === "assigned" &&
      !updateData.assignedTo
    ) {
      const existing = await HandoffRequest.findById(req.params.id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Handoff request not found.",
        });
      }

      if (!existing.assignedTo) {
        return res.status(400).json({
          success: false,
          message: "Assign a representative before marking assigned.",
        });
      }
    }

    const request = await HandoffRequest.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Handoff request not found.",
      });
    }

    return res.json({
      success: true,
      message: "Handoff request updated successfully.",
      request,
    });
  } catch (error) {
    console.error("Update Handoff Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not update handoff request.",
    });
  }
});

module.exports = router;
