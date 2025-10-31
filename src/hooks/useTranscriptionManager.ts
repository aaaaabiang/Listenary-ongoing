import { useCallback, useEffect, useRef } from "react";
import { API_BASE_URL } from "../config/apiConfig";

const TRANSCRIPTION_WS_PATH = "/ws/transcriptions";

type Phrase = {
  text: string;
  offsetMilliseconds: number;
  endOffsetMilliseconds?: number;
};

type WsSentencePayload = {
  text?: string;
  start?: number;
  end?: number;
  offsetMilliseconds?: number;
  endOffsetMilliseconds?: number;
};

type WsMessage = {
  type?: string;
  data?: any;
  message?: string;
};

// function buildWebSocketUrl(path: string) {
//   if (path.startsWith("ws://") || path.startsWith("wss://")) {
//     return path;
//   }
//   const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//   const normalizedPath = path.startsWith("/") ? path : `/${path}`;
//   return `${protocol}://${window.location.host}${normalizedPath}`;
// }

function buildWebSocketUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // 在开发环境中，使用相对路径让Vite代理处理
  if (import.meta.env.DEV) {
    return `ws://localhost:8080${normalizedPath}`;
  }

  // 生产环境中使用环境变量
  const httpBase = API_BASE_URL || "https://listenary-ongoing.fly.dev";
  const wsBase = httpBase.replace(/^https?/i, "wss");
  return `${wsBase}${normalizedPath}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function convertToPhrase(sentence?: WsSentencePayload | null): Phrase | null {
  if (!sentence) {
    return null;
  }

  // 后端已经统一处理了数据格式，直接使用
  const start = sentence.offsetMilliseconds || 0;
  const end = sentence.endOffsetMilliseconds;
  const text = sentence.text?.trim() ?? "";

  return {
    text,
    offsetMilliseconds: start,
    endOffsetMilliseconds: end,
  };
}

export function useTranscriptionManager({
  model,
  episode,
  setIsTranscribing,
  setIsLoading,
}) {
  const socketRef = useRef<WebSocket | null>(null);
  const phrasesRef = useRef<Phrase[]>([]);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "cleanup");
        socketRef.current = null;
      }
    };
  }, []);

  const handleWsMessage = useCallback(
    (message: WsMessage, episodeGuid: string) => {
      if (!message || !message.type) {
        return;
      }

      if (message.type === "sentence") {
        const phrase = convertToPhrase(message.data as WsSentencePayload);
        if (!phrase) {
          return;
        }
        phrasesRef.current = [...phrasesRef.current, phrase];
        model.setResults(phrasesRef.current.slice());
        return;
      }

      if (message.type === "complete" || message.type === "existing") {
        const sentences = Array.isArray(message.data?.sentences)
          ? (message.data.sentences as WsSentencePayload[])
          : [];
        const finalPhrases = sentences
          .map((sentence) => convertToPhrase(sentence))
          .filter(Boolean) as Phrase[];
        phrasesRef.current = finalPhrases;
        model.setResults(finalPhrases);

        model.setTranscriptionPromiseData({
          guid: episodeGuid,
          phrases: finalPhrases,
          status: "complete",
          fullText:
            typeof message.data?.fullText === "string"
              ? message.data.fullText
              : undefined,
        });

        hasCompletedRef.current = true;
        if (setIsTranscribing) setIsTranscribing(false);
        if (setIsLoading) setIsLoading(false);
        return;
      }

      if (message.type === "error") {
        hasCompletedRef.current = true;
        const errorMessage = message.message || "Transcription failed.";
        model.setTranscriptionPromiseError(new Error(errorMessage));
        if (setIsTranscribing) setIsTranscribing(false);
        if (setIsLoading) setIsLoading(false);
        // 错误信息已通过Model层管理，不需要直接调用alert
        return;
      }
    },
    [model, setIsLoading, setIsTranscribing]
  );

  const startStreaming = useCallback(() => {
    const episodeGuid = model.currentEpisode?.guid || episode?.guid;
    const audioUrl = model.audioUrl;

    if (!audioUrl || !episodeGuid) {
      throw new Error("Missing audio URL or episode GUID for transcription");
    }

    if (socketRef.current) {
      socketRef.current.close(1000, "restart-transcription");
    }

    phrasesRef.current = [];
    hasCompletedRef.current = false;
    model.resetTranscriptionState();

    const ws = new WebSocket(buildWebSocketUrl(TRANSCRIPTION_WS_PATH));
    socketRef.current = ws;

    const startPayload = {
      action: "start",
      audioUrl,
      episodeId: episodeGuid,
      rssUrl: model.rssUrl,
    };

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify(startPayload));
    });

    ws.addEventListener("message", (event) => {
      try {
        const parsed = JSON.parse(event.data);
        handleWsMessage(parsed, episodeGuid);
      } catch (err) {
        console.error("Failed to parse transcription message", err);
      }
    });

    ws.addEventListener("error", () => {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        model.setTranscriptionPromiseError(
          new Error("WebSocket connection error during transcription")
        );
        if (setIsTranscribing) setIsTranscribing(false);
        if (setIsLoading) setIsLoading(false);
        // 错误信息已通过Model层管理，不需要直接调用alert
      }
    });

    ws.addEventListener("close", () => {
      if (!hasCompletedRef.current) {
        if (setIsTranscribing) setIsTranscribing(false);
        if (setIsLoading) setIsLoading(false);
      }
      if (socketRef.current === ws) {
        socketRef.current = null;
      }
    });
  }, [episode, handleWsMessage, model, setIsLoading, setIsTranscribing]);

  const handleTranscribe = useCallback(() => {
    if (!episode || !model.audioUrl) {
      console.error("Invalid episode data");
      return;
    }

    if (model.transcripResults?.length > 0) {
      console.warn("This episode has already been transcribed.");
      return;
    }

    if (setIsTranscribing) setIsTranscribing(true);
    if (setIsLoading) setIsLoading(true);

    const audio = new Audio(model.audioUrl);

    const handleMetadata = () => {
      const duration = audio.duration;
      model.setAudioDuration(duration);

      try {
        startStreaming();
      } catch (error: any) {
        console.error("Failed to start transcription stream:", error.message);
        // 错误信息已通过Model层管理，不需要直接调用alert
        if (setIsTranscribing) setIsTranscribing(false);
        if (setIsLoading) setIsLoading(false);
      }
    };

    const handleAudioError = () => {
      console.error("Unable to load audio metadata. Please try again later.");
      // 错误信息已通过Model层管理，不需要直接调用alert
      if (setIsTranscribing) setIsTranscribing(false);
      if (setIsLoading) setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleMetadata, { once: true });
    audio.addEventListener("error", handleAudioError, { once: true });
    audio.load();
  }, [episode, model, setIsLoading, setIsTranscribing, startStreaming]);

  return { handleTranscribe };
}
