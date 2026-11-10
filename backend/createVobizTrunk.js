
require("dotenv").config();

async function createVobizTrunk() {
  const required = [
    "LIVEKIT_URL",
    "LIVEKIT_API_KEY",
    "LIVEKIT_API_SECRET",
    "VOBIZ_SIP_DOMAIN",
    "VOBIZ_USERNAME",
    "VOBIZ_PASSWORD",
    "VOBIZ_OUTBOUND_NUMBER",
  ];

  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length) {
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}`
    );
  }

  const { LiveKitAPI } = await import("livekit-server-sdk");

  let livekitHost = process.env.LIVEKIT_URL.trim();

livekitHost = livekitHost
  .replace(/^wss:\/\//i, "https://")
  .replace(/^ws:\/\//i, "http://");

if (!/^https?:\/\//i.test(livekitHost)) {
  livekitHost = `https://${livekitHost}`;
}
console.log("LiveKit host:", livekitHost);

const livekit = new LiveKitAPI({
  host: livekitHost,
  apiKey: process.env.LIVEKIT_API_KEY,
  secret: process.env.LIVEKIT_API_SECRET,
});

  const trunk = await livekit.sip.createSipOutboundTrunk(
    "Vobiz Outbound",
    process.env.VOBIZ_SIP_DOMAIN,
    [process.env.VOBIZ_OUTBOUND_NUMBER],
    {
      authUsername: process.env.VOBIZ_USERNAME,
      authPassword: process.env.VOBIZ_PASSWORD,
    }
  );

  console.log("Outbound trunk created successfully!");
  console.log("Trunk ID:", trunk.sipTrunkId);
}
createVobizTrunk().catch((error) => {
  console.error("Trunk creation failed:", error.message);

  if (error.cause) {
    console.error("Cause code:", error.cause.code);
    console.error("Cause message:", error.cause.message);
  }

  process.exitCode = 1;
});
