// 	•	编写业务逻辑。
//	•	调用 Repository（数据库）或其他 Service。
import axios from "axios";
import WebSocket from "ws";
import dotenv from "dotenv";
import { Transcription, Sentence, ITranscription } from "../transcriptModel";

dotenv.config();

// export async function createTranscription(userId: string, rssUrl: string) {
//   return {
//     // 返回创建成功的转写任务信息（mock）
//     id: "mock-transcription-id-1 from service",
//     userId: userId,
//     rssUrl: rssUrl,
//     audioUrl: "https://example.com/audio.mp3",
//     status: "processing",
//   };
// }

export async function getTranscriptionById(id: string) {
  // 从数据库查找并返回标准化对象
  try {
    if (!id || !require("mongoose").isValidObjectId(id)) {
      return null;
    }

    const transcription = await Transcription.findById(id).exec();
    if (!transcription) return null;

    const obj = transcription.toObject({
      getters: true,
      versionKey: false,
    }) as any;
    return {
      id: String(obj._id),
      userId: obj.userId,
      rssUrl: obj.rssUrl,
      audioUrl: obj.audioUrl,
      status: obj.status,
      resultText: obj.resultText || "",
      sentences: obj.sentences || [],
      createdAt: obj.createdAt ? obj.createdAt.toISOString() : undefined,
      updatedAt: obj.updatedAt ? obj.updatedAt.toISOString() : undefined,
      meta: obj.meta,
    };
  } catch (err) {
    // 日志或进一步处理可在调用处完成
    throw err;
  }
}

//transcribe audio
type SpeechmaticsSentence = Pick<Sentence, "start" | "end" | "text">;

interface TranscriptionAggregation {
  sentences: SpeechmaticsSentence[];
  fullText: string;
}

interface TranscribeAudioOptions {
  onSentence?: (sentence: SpeechmaticsSentence, index: number) => void;
  onComplete?: (result: TranscriptionAggregation) => void;
  onError?: (error: Error) => void;
}

export async function transcribeAudio(
  audioUrl: string,
  options: TranscribeAudioOptions = {}
): Promise<TranscriptionAggregation> {
  const apiKey = process.env.MATICS_API_KEY;
  if (!apiKey) {
    throw new Error("MATICS_API_KEY missing");
  }

  return new Promise(function (resolve, reject) {
    const ws = new WebSocket("wss://eu2.rt.speechmatics.com/v2/", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    let lastSequenceNumber = -1;

    const sentenceEndRegex = /[.!?]["')\]]*$/;
    const sentences: SpeechmaticsSentence[] = [];
    const fullTextParts: string[] = [];
    let currentSentenceText = "";
    let currentSentenceStart: number | null = null;
    let currentSentenceEnd: number | null = null;
    let resolved = false;

    function toNumber(value: unknown): number | null {
      if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
      }
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    }

    function appendSegmentText(segment: string) {
      const trimmed = segment.trim();
      if (!trimmed) {
        return;
      }

      if (!currentSentenceText) {
        currentSentenceText = trimmed;
        return;
      }

      const lastChar = currentSentenceText[currentSentenceText.length - 1];
      const firstChar = trimmed[0];
      const noSpaceBefore = /[.,!?;:")\]]/;
      const needsSpace =
        lastChar &&
        !/\s/.test(lastChar) &&
        firstChar &&
        !/\s/.test(firstChar) &&
        !noSpaceBefore.test(firstChar);

      currentSentenceText += (needsSpace ? " " : "") + trimmed;
    }

    function finalizeSentence(endTime?: number | null) {
      const text = currentSentenceText.trim();
      if (!text) {
        currentSentenceText = "";
        currentSentenceStart = null;
        currentSentenceEnd = null;
        return;
      }

      const start = currentSentenceStart ?? 0;
      const effectiveEnd =
        typeof endTime === "number"
          ? endTime
          : currentSentenceEnd ?? currentSentenceStart ?? 0;

      const sentence: SpeechmaticsSentence = {
        start,
        end: effectiveEnd,
        text,
      };

      sentences.push(sentence);
      fullTextParts.push(text);
      console.log(
        `[Speechmatics] sentence #${
          sentences.length
        }: "${text}" (start=${start.toFixed(3)}s)`
      );

      if (options.onSentence) {
        options.onSentence(sentence, sentences.length - 1);
      }

      currentSentenceText = "";
      currentSentenceStart = null;
      currentSentenceEnd = null;
    }

    function resolveIfNeeded() {
      if (resolved) {
        return;
      }
      resolved = true;
      const fullText = fullTextParts.join(" ");
      const result: TranscriptionAggregation = { sentences, fullText };
      if (options.onComplete) {
        options.onComplete(result);
      }
      resolve(result);
    }

    ws.on("open", async function () {
      try {
        console.log("WebSocket connection opened");

        const startRecognition = {
          message: "StartRecognition",
          audio_format: {
            type: "file",
          },
          transcription_config: {
            language: "en",
            operating_point: "enhanced",
            output_locale: "en-US",
            max_delay: 1,
            punctuation_overrides: {
              permitted_marks: [".", ",", "!", "?"],
              sensitivity: 0.5,
            },
          },
        };
        ws.send(JSON.stringify(startRecognition));

        const response = await axios.get(audioUrl, { responseType: "stream" });
        const stream = response.data as NodeJS.ReadableStream;

        stream.on("data", function (chunk: Buffer) {
          lastSequenceNumber += 1;
          ws.send(chunk);
        });

        stream.on("end", function () {
          console.log("Audio stream ended");
          const endOfStream = {
            message: "EndOfStream",
            last_seq_no: Math.max(lastSequenceNumber, 0),
          };
          ws.send(JSON.stringify(endOfStream));
        });

        stream.on("error", function (err: Error) {
          ws.close();
          if (options.onError) {
            options.onError(err);
          }
          reject(err);
        });
      } catch (err) {
        ws.close();
        if (options.onError) {
          options.onError(err as Error);
        }
        reject(err as Error);
      }
    });

    ws.on("message", function (data) {
      try {
        const message = JSON.parse(data.toString());
        if (
          message.message === "AddTranscript" &&
          message.metadata?.transcript
        ) {
          const metadata = message.metadata as Record<string, unknown>;
          const transcriptSegment = String(metadata.transcript);
          const isFinal = metadata.is_final;

          if (isFinal === false) {
            // Skip partial updates; wait for final segments.
            return;
          }

          const segmentStart = toNumber(metadata.start_time);
          const segmentEnd = toNumber(metadata.end_time);

          if (currentSentenceStart === null && segmentStart !== null) {
            currentSentenceStart = segmentStart;
          }

          if (segmentEnd !== null) {
            currentSentenceEnd = segmentEnd;
          }

          appendSegmentText(transcriptSegment);

          if (sentenceEndRegex.test(transcriptSegment.trim())) {
            finalizeSentence(segmentEnd);
          }
        } else if (message.message === "EndOfTranscript") {
          console.log("Transcription completed");
          if (currentSentenceText.trim()) {
            finalizeSentence(currentSentenceEnd);
          }
          console.log(
            `[Speechmatics] full transcript: ${fullTextParts.join(" ")}`
          );
          resolveIfNeeded();
          ws.close();
        }
      } catch (err) {
        ws.close();
        if (options.onError) {
          options.onError(err as Error);
        }
        reject(err as Error);
      }
    });

    ws.on("error", function (err) {
      ws.close();
      if (options.onError) {
        options.onError(err as Error);
      }
      reject(err);
    });

    ws.on("close", function () {
      if (!resolved) {
        const error = new Error(
          "WebSocket closed before transcription completed"
        );
        if (options.onError) {
          options.onError(error);
        }
        reject(error);
      }
    });
  });
}

interface TranscriptionStreamCallbacks {
  onExisting?: (payload: {
    transcription: ITranscription;
    sentences: SpeechmaticsSentence[];
    fullText: string;
  }) => void;
  onSentence?: (sentence: SpeechmaticsSentence, index: number) => void;
  onComplete?: (payload: {
    transcription: ITranscription;
    result: TranscriptionAggregation;
  }) => void;
  onError?: (error: Error) => void;
}

export async function streamTranscription(
  userId: string,
  episodeId: string,
  audioUrl: string,
  rssUrl: string,
  callbacks: TranscriptionStreamCallbacks = {},
  force = false
): Promise<ITranscription> {
  let transcription = await Transcription.findOne({ userId, episodeId });

  let errorNotified = false;
  function notifyError(error: Error) {
    if (!errorNotified) {
      errorNotified = true;
      callbacks.onError?.(error);
    }
  }

  if (transcription && transcription.status === "done" && !force) {
    callbacks.onExisting?.({
      transcription,
      sentences: transcription.sentences || [],
      fullText: transcription.resultText || "",
    });
    return transcription;
  }

  if (!transcription) {
    transcription = new Transcription({
      userId,
      episodeId,
      audioUrl,
      rssUrl,
      status: "processing",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    transcription.audioUrl = audioUrl;
    transcription.rssUrl = rssUrl;
    transcription.status = "processing";
    transcription.updatedAt = new Date();
  }

  await transcription.save();

  try {
    const result = await transcribeAudio(audioUrl, {
      onSentence: callbacks.onSentence,
      onError: notifyError,
    });

    transcription.resultText = result.fullText;
    transcription.sentences = result.sentences;
    transcription.status = "done";
    transcription.updatedAt = new Date();

    await transcription.save();

    callbacks.onComplete?.({ transcription, result });
    return transcription;
  } catch (error) {
    transcription.status = "error";
    transcription.updatedAt = new Date();
    await transcription.save();

    notifyError(error as Error);
    throw error;
  }
}

/**
 * Create or get an existing transcription for a given user and episode.
 * If transcription exists and is done, return it.
 * Otherwise, create/update transcription, perform transcription, save result and return.
 */
export async function createOrGetTranscription(
  userId: string,
  episodeId: string,
  audioUrl: string,
  rssUrl: string,
  force = false
) {
  return streamTranscription(userId, episodeId, audioUrl, rssUrl, {}, force);
}

export type { SpeechmaticsSentence, TranscriptionAggregation };

// Formatting helpers used by HTTP and WS controllers
export function sentenceToClientPayload(
  sentence: SpeechmaticsSentence,
  index: number
) {
  const start = Number.isFinite(sentence.start) ? sentence.start : 0;
  const end = Number.isFinite(sentence.end) ? sentence.end : start;
  return {
    index,
    text: sentence.text,
    start,
    end,
    offsetMilliseconds: Math.round(start * 1000),
    endOffsetMilliseconds: Math.round(end * 1000),
  };
}

export function mapSentences(sentences: SpeechmaticsSentence[]) {
  return (sentences || []).map((s, i) => sentenceToClientPayload(s, i));
}

export function buildExistingResponse(transcription: ITranscription) {
  const sentences = Array.isArray(transcription.sentences)
    ? (transcription.sentences as SpeechmaticsSentence[])
    : [];
  return {
    sentences: mapSentences(sentences),
    fullText: transcription.resultText || "",
  };
}
