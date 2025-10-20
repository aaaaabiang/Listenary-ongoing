import mongoose, { Schema, Document, Model } from "mongoose";

// Sentence interface
export interface Sentence {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface ITranscription extends Document {
  userId: string; // 改为Firebase UID字符串
  episodeId: string;
  audioUrl: string;
  status: "pending" | "processing" | "done" | "error";
  resultText?: string;
  rssUrl?: string;
  meta?: object;
  sentences?: Sentence[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Sentence schema
const sentenceSchema = new Schema<Sentence>(
  {
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    text: { type: String, required: true },
    speaker: { type: String },
  },
  { _id: false }
);

const transcriptionSchema: Schema<ITranscription> = new Schema(
  {
    userId: { type: String, required: true }, // 改为Firebase UID字符串
    episodeId: { type: String, required: true },
    audioUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "error"],
      default: "pending",
      required: true,
    },
    resultText: { type: String, default: "" },
    rssUrl: { type: String },
    meta: { type: Object },
    sentences: { type: [sentenceSchema] },
  },
  { timestamps: true }
);

transcriptionSchema.index({ userId: 1, episodeId: 1 }, { unique: true });

const Transcription: Model<ITranscription> = mongoose.model<ITranscription>(
  "Transcription",
  transcriptionSchema
);

export { Transcription };
