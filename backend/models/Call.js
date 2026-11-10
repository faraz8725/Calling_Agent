/*
const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const callSchema = new mongoose.Schema(
  {
    callerNumber: {
      type: String,
      default: ""
    },
    roomName: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["ringing", "in-progress", "completed", "missed", "failed"],
      default: "ringing"
    },
    startedAt: {
      type: Date
    },
    endedAt: {
      type: Date
    },
    duration: {
      type: Number,
      default: 0
    },
    transcript: [transcriptSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Call", callSchema);
*/





const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const callSchema = new mongoose.Schema(
  {
    callerNumber: {
      type: String,
      default: ""
    },
    roomName: {
      type: String,
      required: true,
      unique: true
    },
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      default: "inbound"
    },
    status: {
      type: String,
      enum: ["ringing", "in-progress", "completed", "missed", "failed"],
      default: "ringing"
    },
    startedAt: Date,
    endedAt: Date,
    duration: {
      type: Number,
      default: 0
    },
    transcript: [transcriptSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Call", callSchema);
