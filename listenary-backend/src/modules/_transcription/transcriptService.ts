// 	•	编写业务逻辑。
//	•	调用 Repository（数据库）或其他 Service。

// 示例代码：
// const userRepository = require('./user.repository');

// exports.getUserById = async (id) => {
//   const user = await userRepository.findById(id);
//   if (!user) throw new Error('User not found');
//   return user;
// };
import WebSocket from "ws";
import fs from "fs";
import dotenv from "dotenv";
import { Transcription } from "./transcriptModel";

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
  // 暂时返回 mock，未来会查数据库
  return {
    id: id,
    userId: "mock-user-123 from service",
    rssUrl: "https://example.com/feed.xml",
    audioUrl: "https://example.com/audio.mp3",
    status: "done",
    resultText: "这是转写结果文本（mock）",
    createdAt: new Date().toISOString(),
  };
}

//transcribe audio
export async function transcribeAudio(audioFilePath: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    const apiKey = process.env.MATICS_API_KEY;
    if (!apiKey) {
      reject(new Error("MATICS_API_KEY is not set in environment variables"));
      return;
    }

    const ws = new WebSocket("wss://eu2.rt.speechmatics.com/v2/", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    let sentence = "";
    let results: string[] = [];

    ws.on("open", function () {
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
          //enable punctuation
          punctuation_overrides: {
            permitted_marks: [".", ",", "!", "?"],
            sensitivity: 0.5,
          },
        },
      };
      ws.send(JSON.stringify(startRecognition));

      const stream = fs.createReadStream(audioFilePath);

      let sequenceNumber = 0;
      stream.on("data", function (chunk) {
        ws.send(chunk);
        setTimeout(() => {}, 30); //simulate real-time by adding delay
        sequenceNumber++;
      });

      stream.on("end", function () {
        console.log("Audio file completely read");
        const endOfStream = {
          message: "EndOfStream",
          last_seq_no: sequenceNumber - 1,
        };
        ws.send(JSON.stringify(endOfStream));
      });

      stream.on("error", function (err) {
        ws.close();
        reject(err);
      });
    });

    ws.on("message", function (data) {
      try {
        const message = JSON.parse(data.toString());

        if (message.message === "AddTranscript") {
          if (message.metadata && message.metadata.transcript) {
            sentence += message.metadata.transcript;
            results.push(message.metadata.transcript);
          }
        } else if (message.message === "EndOfTranscript") {
          console.log("Transcription completed");
          ws.close();
          resolve(sentence);
          console.log(sentence);
        }
      } catch (err) {
        ws.close();
        reject(err);
      }
    });

    ws.on("error", function (err) {
      reject(err);
    });

    ws.on("close", function () {
      // If closed before resolving, reject
      if (!sentence) {
        reject(new Error("WebSocket closed before transcription completed"));
      }
    });
  });
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
  rssUrl: string
) {
  // 查询数据库是否已有该用户该集的转写记录
  let transcription = await Transcription.findOne({ userId, episodeId });

  if (transcription && transcription.status === "done") {
    // 如果已有完成的转写，直接返回
    return transcription;
  }

  if (!transcription) {
    // 如果没有记录，创建一条新的
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
    // 有记录但未完成，更新音频和rss链接，状态设为processing
    transcription.audioUrl = audioUrl;
    transcription.rssUrl = rssUrl;
    transcription.status = "processing";
    transcription.updatedAt = new Date();
  }

  // 保存更新后的转写记录（状态为processing）
  await transcription.save();

  try {
    // 调用 transcribeAudio 进行转写，传入音频文件路径
    const resultText = await transcribeAudio(audioUrl);

    // 更新转写结果和状态
    transcription.resultText = resultText;
    transcription.status = "done";
    transcription.updatedAt = new Date();

    // 保存更新后的转写结果
    await transcription.save();

    return transcription;
  } catch (error) {
    // 转写失败，更新状态为 failed 并保存
    transcription.status = "error";
    transcription.updatedAt = new Date();
    await transcription.save();

    throw error;
  }
}
