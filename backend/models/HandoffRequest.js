
const mongoose = require("mongoose");

const handoffRequestSchema = new mongoose.Schema(
  {
    leadName: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    roomName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      default: "outbound",
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "assigned", "completed"],
      default: "pending",
    },

    assignedTo: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "HandoffRequest",
  handoffRequestSchema
);
