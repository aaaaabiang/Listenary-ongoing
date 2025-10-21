import type { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import {
  startStreamTranscription,
  mapSentences,
  sentenceToClientPayload,
  buildExistingResponse,
} from "../service/transcriptionStreamService";
import type { ITranscription } from "../transcriptModel";
import type { SpeechmaticsSentence } from "../service/transcriptService";

interface StartMessage {
  action: "start";
  audioUrl: string;
  episodeId: string;
  rssUrl?: string;
  force?: boolean;
}

interface ClientSentencePayload {
  index: number;
  text: string;
  start: number;
  end: number;
  offsetMilliseconds: number;
  endOffsetMilliseconds: number;
}

interface MessageEnvelope<T = unknown> {
  type: string;
  data?: T;
  message?: string;
}

function safeSend(ws: WebSocket, payload: MessageEnvelope) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

// buildExistingResponse, mapSentences and sentenceToClientPayload are provided
// by the transcriptionStreamService and imported at the top of this file.

export function setupTranscriptionWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/ws/transcriptions" });

  wss.on("connection", (ws) => {
    const state = {
      hasStarted: false,
      closedByServer: false,
      hasErrored: false
    };

    safeSend(ws, { type: "ready" });

    function closeWithMessage(code: number, reason: string) {
      if (
        ws.readyState === WebSocket.CLOSING ||
        ws.readyState === WebSocket.CLOSED
      ) {
        return;
      }
      state.closedByServer = true;
      ws.close(code, reason);
    }

    function handleError(error: Error) {
      if (state.hasErrored) {
        return;
      }
      state.hasErrored = true;
      safeSend(ws, { type: "error", message: error.message });
      closeWithMessage(1011, "transcription-error");
    }

    ws.on("message", async (raw) => {
      if (state.hasStarted) {
        safeSend(ws, {
          type: "error",
          message: "Transcription already in progress for this connection.",
        });
        return;
      }

      let payload: StartMessage;
      try {
        payload = JSON.parse(raw.toString());
      } catch (err) {
        safeSend(ws, { type: "error", message: "Invalid JSON payload." });
        closeWithMessage(1003, "invalid-json");
        return;
      }

      if (payload.action !== "start") {
        safeSend(ws, { type: "error", message: "Unsupported action." });
        return;
      }

      const { audioUrl, episodeId, rssUrl, force } = payload;
      if (!audioUrl || !episodeId) {
        safeSend(ws, {
          type: "error",
          message:
            "audioUrl and episodeId are required to start transcription.",
        });
        closeWithMessage(1008, "missing-parameters");
        return;
      }

      state.hasStarted = true;

      // NOTE: We are not changing auth here. Controller currently uses a userId
      // value from elsewhere; keep a fallback hardcoded ID to preserve behavior.
      const userId = "65fd3a2b9f1c2a0012ab3456";

      safeSend(ws, { type: "started" });

      try {
        await startStreamTranscription(
          userId,
          episodeId,
          audioUrl,
          rssUrl || "",
          {
            onExisting({ transcription }) {
              safeSend(ws, {
                type: "existing",
                data: buildExistingResponse(transcription),
              });
              closeWithMessage(1000, "transcription-exists");
            },
            onSentence(sentence, index) {
              safeSend(ws, {
                type: "sentence",
                data: sentenceToClientPayload(sentence, index),
              });
            },
            onComplete({ transcription, result }) {
              safeSend(ws, {
                type: "complete",
                data: {
                  sentences: mapSentences(result.sentences),
                  fullText: result.fullText,
                },
              });
              closeWithMessage(1000, "transcription-complete");
            },
            onError(error) {
              handleError(error);
            },
          },
          Boolean(force)
        );
      } catch (error) {
        handleError(error as Error);
      }
    });

    ws.on("close", () => {
      if (!closedByServer && ws.readyState === WebSocket.CLOSING) {
        state.closedByServer = true;
      }
    });
  });
}

export type { ClientSentencePayload };
