



/*
import {
  ServerOptions,
  cli,
  defineAgent,
  inference,
  voice,
} from '@livekit/agents';

import {
  EnhancerModel,
  audioEnhancement,
} from '@livekit/plugins-ai-coustics';

import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createAgent } from './agent.ts';

dotenv.config({ path: '.env.local' });

export default defineAgent({
  entry: async (ctx) => {
    const callStartedAt = new Date();

    // Read metadata sent by the backend
    let jobMetadata: {
      direction?: string;
      phone_number?: string;
    } = {};

    try {
      const metadataText = ctx.job.metadata;

      if (metadataText) {
        jobMetadata = JSON.parse(metadataText);
      }
    } catch (error) {
      console.error('Invalid job metadata:', error);
    }

    const direction =
      jobMetadata.direction === 'outbound'
        ? 'outbound'
        : 'inbound';

    const outboundPhoneNumber =
      typeof jobMetadata.phone_number === 'string'
        ? jobMetadata.phone_number
        : '';

    console.log('Call direction:', direction);

    const session = new voice.AgentSession({
      stt: new inference.STT({
        model: 'assemblyai/universal-3-6-pro',

        // No fixed language: automatically detects Hindi and English
        modelOptions: {
          mode: 'balanced',

          prompt:
            'This is an Indian car sales phone conversation. ' +
            'The caller may speak Hindi, Hinglish, or Indian English. ' +
            'Transcribe the exact spoken words. Do not translate.',

          min_turn_silence: 200,
          max_turn_silence: 1000,
          vad_threshold: 0.3,
        },
      }),

      keytermsOptions: {
        keyterms: ['LiveKit', 'FleetInfo'],
        keytermDetection: {
          enabled: true,
        },
      },

      tts: new inference.TTS({
        model: 'fishaudio/s2.1-pro',

        // Keeping the currently configured voice unchanged for this test
        voice: '1021386b765a4c25bd3e167c1a552875',
      }),

      // AssemblyAI handles end-of-turn detection.
      // Interruption detection remains enabled for normal conversation.
      turnHandling: {
        turnDetection: 'stt',

        endpointing: {
          minDelay: 0,
        },

        interruption: {
          mode: 'adaptive',
          minDuration: 800,
          minWords: 1,
          falseInterruptionTimeout: 2000,
          resumeFalseInterruption: true,
        },
      },

      vad: new inference.VAD({
        model: 'silero',
        activationThreshold: 0.3,
      }),

      expressive: true,
    });

    await session.start({
      agent: createAgent(),
      room: ctx.room,

      inputOptions: {
        noiseCancellation: audioEnhancement({
          model: EnhancerModel.QuailVfS,
        }),
      },
    });

    await ctx.connect();

    const participant = await ctx.waitForParticipant();

    const callerNumber =
      participant.attributes?.['sip.phoneNumber'] ||
      outboundPhoneNumber ||
      '';

    console.log(
      'Phone participant connected:',
      callerNumber ? 'Number available' : 'Number unavailable'
    );

    ctx.addShutdownCallback(async () => {
      try {
        const history = session.history;

        const transcript = history.items.flatMap((item) => {
          if (!('role' in item) || !('textContent' in item)) {
            return [];
          }

          if (
            item.role !== 'user' &&
            item.role !== 'assistant'
          ) {
            return [];
          }

          const content =
            typeof item.textContent === 'string'
              ? item.textContent
              : '';

          if (!content.trim()) {
            return [];
          }

          return [
            {
              role: item.role,
              content,
            },
          ];
        });

        const endedAt = new Date();

        const apiUrl = process.env.CALL_HISTORY_API_URL;
        const secret = process.env.CALL_HISTORY_SECRET;

        if (!apiUrl || !secret) {
          console.error(
            'Call history environment variables missing'
          );
          return;
        }

        const response = await fetch(
          `${apiUrl}/api/calls/sync`,
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
              'x-call-history-secret': secret,
            },

            body: JSON.stringify({
              roomName: ctx.room.name,
              callerNumber,
              direction,
              status: 'completed',
              startedAt: callStartedAt.toISOString(),
              endedAt: endedAt.toISOString(),
              transcript,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        console.log('Call history saved successfully!');
        console.log('Call direction:', direction);
        console.log(
          'Transcript messages:',
          transcript.length
        );
      } catch (error) {
        console.error(
          'Call history save failed:',
          error
        );
      }
    });

    // Protect the initial greeting from accidental interruption.
    session.generateReply({
      instructions:
        'Greet the customer briefly in Hindi. ' +
        'Introduce yourself as FleetInfo ki AI assistant. ' +
        'Then ask which car they want to buy. ' +
        'Speak naturally and clearly. Keep the greeting short.',

      allowInterruptions: false,
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'my-agent',
    initializeProcessTimeout: 60_000,
  })
);
*/
/*

import {
  ServerOptions,
  cli,
  defineAgent,
  inference,
  voice,
} from '@livekit/agents';

import {
  EnhancerModel,
  audioEnhancement,
} from '@livekit/plugins-ai-coustics';

import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createAgent } from './agent.ts';

dotenv.config({ path: '.env.local' });

export default defineAgent({
  entry: async (ctx) => {
    const callStartedAt = new Date();

    let jobMetadata: {
      direction?: string;
      phone_number?: string;
      lead_name?: string;
    } = {};

    try {
      const metadataText = ctx.job.metadata;

      if (metadataText) {
        jobMetadata = JSON.parse(metadataText);
      }
    } catch (error) {
      console.error('Invalid job metadata:', error);
    }

    const direction =
      jobMetadata.direction === 'outbound'
        ? 'outbound'
        : 'inbound';

    const outboundPhoneNumber =
      typeof jobMetadata.phone_number === 'string'
        ? jobMetadata.phone_number
        : '';

    const leadName =
      typeof jobMetadata.lead_name === 'string'
        ? jobMetadata.lead_name.trim().slice(0, 80)
        : '';

    console.log('Call direction:', direction);
    console.log('Lead name available:', Boolean(leadName));

    const session = new voice.AgentSession({
      stt: new inference.STT({
        model: 'assemblyai/universal-3-6-pro',
        modelOptions: {
          mode: 'balanced',
          prompt:
            'This is an Indian car sales phone conversation. ' +
            'The caller may speak Hindi, Hinglish, or Indian English. ' +
            'Transcribe the exact spoken words. Do not translate.',
          min_turn_silence: 200,
          max_turn_silence: 1000,
          vad_threshold: 0.3,
        },
      }),

      keytermsOptions: {
        keyterms: ['LiveKit', 'FleetInfo'],
        keytermDetection: {
          enabled: true,
        },
      },

      // Existing TTS configuration kept unchanged.
      tts: new inference.TTS({
        model: 'fishaudio/s2.1-pro',
        voice: 'abe6814788b249ea89b627ffc05fa095',
      }),

      turnHandling: {
        turnDetection: 'stt',
        endpointing: {
          minDelay: 0,
        },
        interruption: {
          mode: 'adaptive',
          minDuration: 800,
          minWords: 1,
          falseInterruptionTimeout: 2000,
          resumeFalseInterruption: true,
        },
      },

      vad: new inference.VAD({
        model: 'silero',
        activationThreshold: 0.3,
      }),

      expressive: true,
    });

    await session.start({
      agent: createAgent(leadName),
      room: ctx.room,

      inputOptions: {
        noiseCancellation: audioEnhancement({
          model: EnhancerModel.QuailVfS,
        }),
      },
    });

    await ctx.connect();

    const participant = await ctx.waitForParticipant();

    const callerNumber =
      participant.attributes?.['sip.phoneNumber'] ||
      outboundPhoneNumber ||
      '';

    console.log(
      'Phone participant connected:',
      callerNumber ? 'Number available' : 'Number unavailable'
    );

    ctx.addShutdownCallback(async () => {
      try {
        const history = session.history;

        const transcript = history.items.flatMap((item) => {
          if (!('role' in item) || !('textContent' in item)) {
            return [];
          }

          if (
            item.role !== 'user' &&
            item.role !== 'assistant'
          ) {
            return [];
          }

          const content =
            typeof item.textContent === 'string'
              ? item.textContent
              : '';

          if (!content.trim()) {
            return [];
          }

          return [
            {
              role: item.role,
              content,
            },
          ];
        });

        const endedAt = new Date();

        const apiUrl = process.env.CALL_HISTORY_API_URL;
        const secret = process.env.CALL_HISTORY_SECRET;

        if (!apiUrl || !secret) {
          console.error(
            'Call history environment variables missing'
          );
          return;
        }

        const response = await fetch(
          `${apiUrl}/api/calls/sync`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-call-history-secret': secret,
            },
            body: JSON.stringify({
              roomName: ctx.room.name,
              callerNumber,
              direction,
              status: 'completed',
              startedAt: callStartedAt.toISOString(),
              endedAt: endedAt.toISOString(),
              transcript,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned ${response.status}`
          );
        }

        console.log('Call history saved successfully!');
        console.log('Call direction:', direction);
        console.log('Transcript messages:', transcript.length);
      } catch (error) {
        console.error('Call history save failed:', error);
      }
    });

    const greeting = leadName
      ? `Greet the customer by saying "Hello ${leadName} ji, namaste!" Then introduce yourself as FleetInfo ki AI assistant and ask which car they are interested in.`
      : 'Greet the customer in Hindi with "Hello ji, namaste!" Then introduce yourself as FleetInfo ki AI assistant and ask which car they are interested in.';

    session.generateReply({
      instructions:
        greeting +
        ' Speak naturally and clearly. Keep the greeting short.',
      allowInterruptions: false,
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'my-agent',
    initializeProcessTimeout: 60_000,
  })
);
*/




/*


import {
  ServerOptions,
  cli,
  defineAgent,
  inference,
  voice,
} from '@livekit/agents';

import {
  EnhancerModel,
  audioEnhancement,
} from '@livekit/plugins-ai-coustics';

import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createAgent } from './agent.ts';

dotenv.config({ path: '.env.local' });

export default defineAgent({
  entry: async (ctx) => {
    const callStartedAt = new Date();

    let jobMetadata: {
      direction?: string;
      phone_number?: string;
      lead_name?: string;
    } = {};

    try {
      const metadataText = ctx.job.metadata;

      if (metadataText) {
        jobMetadata = JSON.parse(metadataText);
      }
    } catch (error) {
      console.error('Invalid job metadata:', error);
    }

    const direction: 'inbound' | 'outbound' =
      jobMetadata.direction === 'outbound'
        ? 'outbound'
        : 'inbound';

    const outboundPhoneNumber =
      typeof jobMetadata.phone_number === 'string'
        ? jobMetadata.phone_number
        : '';

    const leadName =
      typeof jobMetadata.lead_name === 'string'
        ? jobMetadata.lead_name.trim().slice(0, 80)
        : '';

   // const roomName = ctx.room.name;
const roomName = ctx.room.name ?? '';

    // This value is updated after the phone participant connects.
    let callerNumber = outboundPhoneNumber;

    console.log('Call direction:', direction);
    console.log('Lead name available:', Boolean(leadName));

    const session = new voice.AgentSession({
      stt: new inference.STT({
        model: 'assemblyai/universal-3-6-pro',

        modelOptions: {
          mode: 'balanced',
          prompt:
            'This is an Indian car sales phone conversation. ' +
            'The caller may speak Hindi, Hinglish, or Indian English. ' +
            'Transcribe the exact spoken words. Do not translate.',
          min_turn_silence: 200,
          max_turn_silence: 1000,
          vad_threshold: 0.3,
        },
      }),

      keytermsOptions: {
        keyterms: ['LiveKit', 'FleetInfo'],
        keytermDetection: {
          enabled: true,
        },
      },

      tts: new inference.TTS({
        model: 'fishaudio/s2.1-pro',
        voice: '1021386b765a4c25bd3e167c1a552875',
      }),

      turnHandling: {
        turnDetection: 'stt',
        endpointing: {
          minDelay: 0,
        },
        interruption: {
          mode: 'adaptive',
          minDuration: 800,
          minWords: 1,
          falseInterruptionTimeout: 2000,
          resumeFalseInterruption: true,
        },
      },

      vad: new inference.VAD({
        model: 'silero',
        activationThreshold: 0.3,
      }),

      expressive: true,
    });

    await session.start({
      agent: createAgent({
        leadName,
        phoneNumber: outboundPhoneNumber,
        direction,
        roomName,
        getCallerNumber: () => callerNumber,
      }),

      room: ctx.room,

      inputOptions: {
        noiseCancellation: audioEnhancement({
          model: EnhancerModel.QuailVfS,
        }),
      },
    });

    await ctx.connect();

    const participant = await ctx.waitForParticipant();

    callerNumber =
      participant.attributes?.['sip.phoneNumber'] ||
      outboundPhoneNumber ||
      '';

    console.log(
      'Phone participant connected:',
      callerNumber ? 'Number available' : 'Number unavailable'
    );

    ctx.addShutdownCallback(async () => {
      try {
        const history = session.history;

        const transcript = history.items.flatMap((item) => {
          if (!('role' in item) || !('textContent' in item)) {
            return [];
          }

          if (
            item.role !== 'user' &&
            item.role !== 'assistant'
          ) {
            return [];
          }

          const content =
            typeof item.textContent === 'string'
              ? item.textContent
              : '';

          if (!content.trim()) {
            return [];
          }

          return [
            {
              role: item.role,
              content,
            },
          ];
        });

        const endedAt = new Date();

        const apiUrl = process.env.CALL_HISTORY_API_URL;
        const secret = process.env.CALL_HISTORY_SECRET;

        if (!apiUrl || !secret) {
          console.error(
            'Call history environment variables missing'
          );
          return;
        }

        const response = await fetch(
          `${apiUrl}/api/calls/sync`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-call-history-secret': secret,
            },
            body: JSON.stringify({
              roomName,
              callerNumber,
              direction,
              status: 'completed',
              startedAt: callStartedAt.toISOString(),
              endedAt: endedAt.toISOString(),
              transcript,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        console.log('Call history saved successfully!');
        console.log('Call direction:', direction);
        console.log('Transcript messages:', transcript.length);
      } catch (error) {
        console.error('Call history save failed:', error);
      }
    });

    session.generateReply({
      instructions:
        'Greet the customer briefly in Hindi. ' +
        'Introduce yourself as FleetInfo ki AI assistant. ' +
        'Then ask which car they want to buy. ' +
        'Speak naturally and clearly. Keep the greeting short.',
      allowInterruptions: false,
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'my-agent',
    initializeProcessTimeout: 60_000,
  })
);
*/

import {
  ServerOptions,
  cli,
  defineAgent,
  inference,
  voice,
} from "@livekit/agents";

import {
  EnhancerModel,
  audioEnhancement,
} from "@livekit/plugins-ai-coustics";

import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { createAgent } from "./agent.ts";

dotenv.config({ path: ".env.local" });

export default defineAgent({
  entry: async (ctx) => {
    const callStartedAt = new Date();

    let jobMetadata: {
      direction?: string;
      phone_number?: string;
      lead_name?: string;
    } = {};

    try {
      const metadataText = ctx.job.metadata;

      if (metadataText) {
        jobMetadata = JSON.parse(metadataText);
      }
    } catch (error) {
      console.error("Invalid job metadata:", error);
    }

    const direction: "inbound" | "outbound" =
      jobMetadata.direction === "outbound"
        ? "outbound"
        : "inbound";

    const outboundPhoneNumber =
      typeof jobMetadata.phone_number === "string"
        ? jobMetadata.phone_number
        : "";

    const leadName =
      typeof jobMetadata.lead_name === "string"
        ? jobMetadata.lead_name.trim().slice(0, 80)
        : "";

    // Read room name dynamically because it may not be available yet.
    const getRoomName = () => ctx.room.name ?? "";

    // This value is updated after the phone participant connects.
    let callerNumber = outboundPhoneNumber;

    console.log("Call direction:", direction);
    console.log("Lead name available:", Boolean(leadName));

    const session = new voice.AgentSession({
      stt: new inference.STT({
        model: "assemblyai/universal-3-6-pro",

        modelOptions: {
          mode: "balanced",
          prompt:
            "This is an Indian car sales phone conversation. " +
            "The caller may speak Hindi, Hinglish, or Indian English. " +
            "Transcribe the exact spoken words. Do not translate.",
          min_turn_silence: 200,
          max_turn_silence: 1000,
          vad_threshold: 0.3,
        },
      }),

      keytermsOptions: {
        keyterms: ["LiveKit", "FleetInfo"],
        keytermDetection: {
          enabled: true,
        },
      },

      tts: new inference.TTS({
        model: "fishaudio/s2.1-pro",
        voice: "1021386b765a4c25bd3e167c1a552875",
      }),

      turnHandling: {
        turnDetection: "stt",
        endpointing: {
          minDelay: 0,
        },
        interruption: {
          mode: "adaptive",
          minDuration: 800,
          minWords: 1,
          falseInterruptionTimeout: 2000,
          resumeFalseInterruption: true,
        },
      },

      vad: new inference.VAD({
        model: "silero",
        activationThreshold: 0.3,
      }),

      expressive: true,
    });

    await session.start({
      agent: createAgent({
        leadName,
        phoneNumber: outboundPhoneNumber,
        direction,

        // Both values are read when the tool actually executes.
        getRoomName,
        getCallerNumber: () => callerNumber,
      }),

      room: ctx.room,

      inputOptions: {
        noiseCancellation: audioEnhancement({
          model: EnhancerModel.QuailVfS,
        }),
      },
    });

    await ctx.connect();

    const participant = await ctx.waitForParticipant();

    callerNumber =
      participant.attributes?.["sip.phoneNumber"] ||
      outboundPhoneNumber ||
      "";

    console.log(
      "Phone participant connected:",
      callerNumber ? "Number available" : "Number unavailable"
    );

    console.log("LiveKit room name:", getRoomName() || "Not available");

    ctx.addShutdownCallback(async () => {
      try {
        const history = session.history;

        const transcript = history.items.flatMap((item) => {
          if (!("role" in item) || !("textContent" in item)) {
            return [];
          }

          if (
            item.role !== "user" &&
            item.role !== "assistant"
          ) {
            return [];
          }

          const content =
            typeof item.textContent === "string"
              ? item.textContent
              : "";

          if (!content.trim()) {
            return [];
          }

          return [
            {
              role: item.role,
              content,
            },
          ];
        });

        const endedAt = new Date();

        const apiUrl = process.env.CALL_HISTORY_API_URL;
        const secret = process.env.CALL_HISTORY_SECRET;

        if (!apiUrl || !secret) {
          console.error(
            "Call history environment variables missing"
          );
          return;
        }

        const response = await fetch(
          `${apiUrl.replace(/\/+$/, "")}/api/calls/sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-call-history-secret": secret,
            },
            body: JSON.stringify({
              roomName: getRoomName(),
              callerNumber,
              direction,
              status: "completed",
              startedAt: callStartedAt.toISOString(),
              endedAt: endedAt.toISOString(),
              transcript,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            `Backend returned ${response.status}: ${errorText}`
          );
        }

        console.log("Call history saved successfully!");
        console.log("Call direction:", direction);
        console.log("Transcript messages:", transcript.length);
      } catch (error) {
        console.error("Call history save failed:", error);
      }
    });

    session.generateReply({
      instructions:
        "Greet the customer briefly in Hindi. " +
        "Introduce yourself as FleetInfo ki AI assistant. " +
        "Then ask which car they want to buy. " +
        "Speak naturally and clearly. Keep the greeting short.",
      allowInterruptions: false,
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: "my-agent",
    initializeProcessTimeout: 60_000,
  })
);