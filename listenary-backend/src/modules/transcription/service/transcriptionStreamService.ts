import { streamTranscription } from "./transcriptService";
import type { ITranscription } from "../transcriptModel";
import type { SpeechmaticsSentence } from "./transcriptService";
import {
  sentenceToClientPayload,
  mapSentences,
  buildExistingResponse,
} from "./transcriptService";

export { sentenceToClientPayload, mapSentences, buildExistingResponse };

export async function startStreamTranscription(
  userId: string,
  episodeId: string,
  audioUrl: string,
  rssUrl: string,
  handlers: {
    onExisting?: (payload: { transcription: ITranscription }) => void;
    onSentence?: (sentence: SpeechmaticsSentence, index: number) => void;
    onComplete?: (payload: {
      transcription: ITranscription;
      result: { sentences: SpeechmaticsSentence[]; fullText: string };
    }) => void;
    onError?: (err: Error) => void;
  },
  force = false
) {
  return streamTranscription(
    userId,
    episodeId,
    audioUrl,
    rssUrl,
    {
      onExisting({ transcription }) {
        handlers.onExisting?.({ transcription });
      },
      onSentence(sentence, index) {
        handlers.onSentence?.(sentence, index);
      },
      onComplete({ transcription, result }) {
        handlers.onComplete?.({ transcription, result });
      },
      onError(error) {
        handlers.onError?.(error);
      },
    },
    Boolean(force)
  );
}
