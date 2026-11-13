
/*

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { rateLimit } = require("express-rate-limit");
const { randomUUID } = require("crypto");
const leadRoutes = require("./routes/leadRoutes");
const Call = require("./models/Call");
const HandoffRequest = require("./models/HandoffRequest");
const handoffRoutes = require("./routes/handoffRoutes");
const app = express();

app.use(cors());
app.use(express.json());

// ======================================
// ENVIRONMENT VALIDATION
// ======================================

const requiredAuthEnv = [
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "JWT_SECRET",
];

const missingAuthEnv = requiredAuthEnv.filter(
  (key) => !process.env[key]
);

if (missingAuthEnv.length > 0) {
  console.error(
    "Missing authentication environment variables:",
    missingAuthEnv.join(", ")
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be at least 32 characters.");
  process.exit(1);
}

// ======================================
// MONGODB CONNECTION
// ======================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// ======================================
// BASIC ROUTE
// ======================================

app.get("/", (req, res) => {
  res.send("Call_China AI Backend is running!");
});

// ======================================
// LOGIN RATE LIMITER
// ======================================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again after 15 minutes.",
  },
});

// ======================================
// ADMIN LOGIN
// POST /api/auth/login
// ======================================

app.post("/api/auth/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const enteredEmail = email.trim().toLowerCase();

    const emailMatches = enteredEmail === adminEmail;

    // Always perform a password comparison.
    const passwordMatches = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        email: adminEmail,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        email: adminEmail,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// ======================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ======================================

const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      decoded.role !== "admin" ||
      decoded.email !== process.env.ADMIN_EMAIL.trim().toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access only.",
      });
    }

    req.admin = {
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session. Please login again.",
    });
  }
};


// ======================================
// LEADS ROUTES
// ADMIN ONLY
// ======================================

app.use("/api/leads", protectAdmin, leadRoutes);


// ======================================
// CHECK CURRENT ADMIN SESSION
// GET /api/auth/me
// ======================================

app.get("/api/auth/me", protectAdmin, (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});

// ======================================
// OLLAMA AI CHAT
// POST /api/chat
// ======================================

app.post("/api/chat", protectAdmin, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen3:1.7b",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant. Reply in simple Hinglish.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    res.json({
      success: true,
      reply: data.message.content,
    });
  } catch (error) {
    console.error("AI Error:", error.message);

    res.status(500).json({
      success: false,
      error: "AI model se connection nahi ho paya.",
    });
  }
});

// ======================================
// LIVEKIT CALL HISTORY SYNC
// POST /api/calls/sync
// Agent authenticates using its own secret.
// Do not add admin JWT middleware here.
// ======================================

app.post("/api/calls/sync", async (req, res) => {
  try {
    const secret = req.headers["x-call-history-secret"];

    if (
      !process.env.CALL_HISTORY_SECRET ||
      secret !== process.env.CALL_HISTORY_SECRET
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      roomName,
      callerNumber,
      direction,
      status,
      startedAt,
      endedAt,
      transcript,
    } = req.body;

    if (!roomName) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    const updateData = {};

    if (callerNumber !== undefined) updateData.callerNumber = callerNumber;
    if (direction !== undefined) updateData.direction = direction;
    if (status !== undefined) updateData.status = status;
    if (startedAt !== undefined) updateData.startedAt = startedAt;
    if (endedAt !== undefined) updateData.endedAt = endedAt;
    if (transcript !== undefined) updateData.transcript = transcript;

    if (startedAt && endedAt) {
      const duration =
        (new Date(endedAt) - new Date(startedAt)) / 1000;

      updateData.duration = Math.max(0, Math.floor(duration));
    }

    const call = await Call.findOneAndUpdate(
      { roomName },
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      success: true,
      message: "Call history saved",
      call,
    });
  } catch (error) {
    console.error("Call Sync Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not save call history",
    });
  }
});

// ======================================
// OUTBOUND CALL
// POST /api/calls/outbound
// ADMIN ONLY
// ======================================

app.post("/api/calls/outbound", protectAdmin, async (req, res) => {
  let roomName;

  try {
    const { phoneNumber ,leadName} = req.body;

    if (!/^\+91[6-9]\d{9}$/.test(phoneNumber || "")) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid Indian mobile number with +91",
      });
    }

    const requiredEnv = [
      "LIVEKIT_URL",
      "LIVEKIT_API_KEY",
      "LIVEKIT_API_SECRET",
      "LIVEKIT_OUTBOUND_TRUNK_ID",
    ];

    const missing = requiredEnv.filter(
      (key) => !process.env[key]
    );

    if (missing.length > 0) {
      return res.status(503).json({
        success: false,
        message: "LiveKit outbound calling is not configured yet.",
      });
    }

    const { LiveKitAPI } = await import("livekit-server-sdk");

    const livekit = new LiveKitAPI({
      host: process.env.LIVEKIT_URL,
      apiKey: process.env.LIVEKIT_API_KEY,
      secret: process.env.LIVEKIT_API_SECRET,
    });

    roomName = `outbound-${randomUUID()}`;

    await Call.create({
      roomName,
      callerNumber: phoneNumber,
      direction: "outbound",
      status: "ringing",
      startedAt: new Date(),
    });

    await livekit.agentDispatch.createDispatch(
      roomName,
      process.env.LIVEKIT_AGENT_NAME || "my-agent",
      {
        metadata: JSON.stringify({
          direction: "outbound",
          phone_number: phoneNumber,
          lead_name:
    typeof leadName === "string"
      ? leadName.trim().slice(0, 80)
      : "",
        }),
      }
    );

    await livekit.sip.createSipParticipant(
      process.env.LIVEKIT_OUTBOUND_TRUNK_ID,
      phoneNumber,
      roomName,
      {
        participantIdentity: `phone-${randomUUID()}`,
        participantName: "Customer",
        waitUntilAnswered: true,
      }
    );

    await Call.findOneAndUpdate(
      { roomName },
      { $set: { status: "in-progress" } }
    );

    res.status(201).json({
      success: true,
      message: "Customer answered. Call connected.",
      roomName,
    });
  } catch (error) {
    console.error("Outbound Call Error:", error.message);

    if (roomName) {
      await Call.findOneAndUpdate(
        { roomName },
        {
          $set: {
            status: "failed",
            endedAt: new Date(),
          },
        }
      ).catch(console.error);
    }

    res.status(500).json({
      success: false,
      message: "Could not initiate outbound call.",
    });
  }
});

// ======================================
// GET ALL CALLS
// ADMIN ONLY
// ======================================

app.get("/api/calls", protectAdmin, async (req, res) => {
  try {
    const calls = await Call.find()
      .select("-transcript")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      calls,
    });
  } catch (error) {
    console.error("Fetch Calls Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch call history",
    });
  }
});

// ======================================
// GET ONE CALL WITH TRANSCRIPT
// ADMIN ONLY
// ======================================

app.get("/api/calls/:id", protectAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid call ID",
      });
    }

    const call = await Call.findById(req.params.id);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    res.json({
      success: true,
      call,
    });
  } catch (error) {
    console.error("Fetch Call Details Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch call details",
    });
  }
});

// ======================================
// START SERVER
// ======================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Call_China backend running on port ${PORT}`);
});
*/







require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { rateLimit } = require("express-rate-limit");
const { randomUUID } = require("crypto");

const leadRoutes = require("./routes/leadRoutes");
const Call = require("./models/Call");
const HandoffRequest = require("./models/HandoffRequest");
const handoffRoutes = require("./routes/handoffRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ======================================
// ENVIRONMENT VALIDATION
// ======================================

const requiredAuthEnv = [
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "JWT_SECRET",
];

const missingAuthEnv = requiredAuthEnv.filter(
  (key) => !process.env[key]
);

if (missingAuthEnv.length > 0) {
  console.error(
    "Missing authentication environment variables:",
    missingAuthEnv.join(", ")
  );
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be at least 32 characters.");
  process.exit(1);
}

// ======================================
// MONGODB CONNECTION
// ======================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// ======================================
// BASIC ROUTE
// ======================================

app.get("/", (req, res) => {
  res.send("Call_China AI Backend is running!");
});

// ======================================
// LOGIN RATE LIMITER
// ======================================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again after 15 minutes.",
  },
});

// ======================================
// ADMIN LOGIN
// POST /api/auth/login
// ======================================

app.post("/api/auth/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const enteredEmail = email.trim().toLowerCase();

    const emailMatches = enteredEmail === adminEmail;

    const passwordMatches = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        email: adminEmail,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        email: adminEmail,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// ======================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ======================================

const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      decoded.role !== "admin" ||
      decoded.email !== process.env.ADMIN_EMAIL.trim().toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access only.",
      });
    }

    req.admin = {
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session. Please login again.",
    });
  }
};

// ======================================
// HUMAN HANDOFF - AI AGENT REQUEST
// POST /api/handoffs/agent
// Authenticated using private shared secret
// ======================================

app.post("/api/handoffs/agent", async (req, res) => {
  try {
    const providedSecret = req.headers["x-handoff-secret"];
    const expectedSecret = process.env.HANDOFF_API_SECRET;

    if (!expectedSecret || typeof providedSecret !== "string") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const providedBuffer = Buffer.from(providedSecret);
    const expectedBuffer = Buffer.from(expectedSecret);

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      leadName,
      phoneNumber,
      roomName,
      direction,
      reason,
    } = req.body;

    if (
      typeof phoneNumber !== "string" ||
      !phoneNumber.trim() ||
      typeof roomName !== "string" ||
      !roomName.trim() ||
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Phone number, room name and reason are required.",
      });
    }

    if (!["inbound", "outbound"].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: "Invalid call direction.",
      });
    }

    const request = await HandoffRequest.findOneAndUpdate(
      { roomName: roomName.trim() },
      {
        $setOnInsert: {
          leadName:
            typeof leadName === "string"
              ? leadName.trim().slice(0, 80)
              : "Unknown",

          phoneNumber: phoneNumber.trim().slice(0, 30),
          roomName: roomName.trim().slice(0, 150),
          direction,
          reason: reason.trim().slice(0, 500),
          status: "pending",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Human handoff request saved.",
      request,
    });

  } catch (error) {
    console.error("Create Handoff Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create handoff request.",
    });
  }
});

// ======================================
// LEADS ROUTES
// ADMIN ONLY
// ======================================

app.use("/api/leads", protectAdmin, leadRoutes);

// ======================================
// HUMAN HANDOFF ADMIN ROUTES
// ADMIN ONLY
// ======================================

app.use("/api/handoffs", protectAdmin, handoffRoutes);

// ======================================
// CHECK CURRENT ADMIN SESSION
// GET /api/auth/me
// ======================================

app.get("/api/auth/me", protectAdmin, (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});

// ======================================
// OLLAMA AI CHAT
// POST /api/chat
// ======================================

app.post("/api/chat", protectAdmin, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen3:1.7b",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant. Reply in simple Hinglish.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    res.json({
      success: true,
      reply: data.message.content,
    });
  } catch (error) {
    console.error("AI Error:", error.message);

    res.status(500).json({
      success: false,
      error: "AI model se connection nahi ho paya.",
    });
  }
});

// ======================================
// LIVEKIT CALL HISTORY SYNC
// POST /api/calls/sync
// ======================================

app.post("/api/calls/sync", async (req, res) => {
  try {
    const secret = req.headers["x-call-history-secret"];

    if (
      !process.env.CALL_HISTORY_SECRET ||
      secret !== process.env.CALL_HISTORY_SECRET
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      roomName,
      callerNumber,
      direction,
      status,
      startedAt,
      endedAt,
      transcript,
    } = req.body;

    if (!roomName) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    const updateData = {};

    if (callerNumber !== undefined) updateData.callerNumber = callerNumber;
    if (direction !== undefined) updateData.direction = direction;
    if (status !== undefined) updateData.status = status;
    if (startedAt !== undefined) updateData.startedAt = startedAt;
    if (endedAt !== undefined) updateData.endedAt = endedAt;
    if (transcript !== undefined) updateData.transcript = transcript;

    if (startedAt && endedAt) {
      const duration =
        (new Date(endedAt) - new Date(startedAt)) / 1000;

      updateData.duration = Math.max(0, Math.floor(duration));
    }

    const call = await Call.findOneAndUpdate(
      { roomName },
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      success: true,
      message: "Call history saved",
      call,
    });
  } catch (error) {
    console.error("Call Sync Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not save call history",
    });
  }
});

// ======================================
// OUTBOUND CALL
// POST /api/calls/outbound
// ADMIN ONLY
// ======================================

app.post("/api/calls/outbound", protectAdmin, async (req, res) => {
  let roomName;

  try {
    const { phoneNumber, leadName } = req.body;

    if (!/^\+91[6-9]\d{9}$/.test(phoneNumber || "")) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid Indian mobile number with +91",
      });
    }

    const requiredEnv = [
      "LIVEKIT_URL",
      "LIVEKIT_API_KEY",
      "LIVEKIT_API_SECRET",
      "LIVEKIT_OUTBOUND_TRUNK_ID",
    ];

    const missing = requiredEnv.filter(
      (key) => !process.env[key]
    );

    if (missing.length > 0) {
      return res.status(503).json({
        success: false,
        message: "LiveKit outbound calling is not configured yet.",
      });
    }

    const { LiveKitAPI } = await import("livekit-server-sdk");

    const livekit = new LiveKitAPI({
      host: process.env.LIVEKIT_URL,
      apiKey: process.env.LIVEKIT_API_KEY,
      secret: process.env.LIVEKIT_API_SECRET,
    });

    roomName = `outbound-${randomUUID()}`;

    await Call.create({
      roomName,
      callerNumber: phoneNumber,
      direction: "outbound",
      status: "ringing",
      startedAt: new Date(),
    });

    await livekit.agentDispatch.createDispatch(
      roomName,
      process.env.LIVEKIT_AGENT_NAME || "my-agent",
      {
        metadata: JSON.stringify({
          direction: "outbound",
          phone_number: phoneNumber,
          lead_name:
            typeof leadName === "string"
              ? leadName.trim().slice(0, 80)
              : "",
        }),
      }
    );

    await livekit.sip.createSipParticipant(
      process.env.LIVEKIT_OUTBOUND_TRUNK_ID,
      phoneNumber,
      roomName,
      {
        participantIdentity: `phone-${randomUUID()}`,
        participantName: "Customer",
        waitUntilAnswered: true,
      }
    );

    await Call.findOneAndUpdate(
      { roomName },
      { $set: { status: "in-progress" } }
    );

    res.status(201).json({
      success: true,
      message: "Customer answered. Call connected.",
      roomName,
    });
  } catch (error) {
    console.error("Outbound Call Error:", error.message);

    if (roomName) {
      await Call.findOneAndUpdate(
        { roomName },
        {
          $set: {
            status: "failed",
            endedAt: new Date(),
          },
        }
      ).catch(console.error);
    }

    res.status(500).json({
      success: false,
      message: "Could not initiate outbound call.",
    });
  }
});

// ======================================
// GET ALL CALLS
// ADMIN ONLY
// ======================================

app.get("/api/calls", protectAdmin, async (req, res) => {
  try {
    const calls = await Call.find()
      .select("-transcript")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      calls,
    });
  } catch (error) {
    console.error("Fetch Calls Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch call history",
    });
  }
});

// ======================================
// GET ONE CALL WITH TRANSCRIPT
// ADMIN ONLY
// ======================================

app.get("/api/calls/:id", protectAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid call ID",
      });
    }

    const call = await Call.findById(req.params.id);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    res.json({
      success: true,
      call,
    });
  } catch (error) {
    console.error("Fetch Call Details Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch call details",
    });
  }
});

// ======================================
// START SERVER
// ======================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Call_China backend running on port ${PORT}`);
});
