import WebSocket from "ws";
import fs, { lstatSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

// function WebsocketASR(params) {
const WSS_URL = "wss://eu2.rt.speechmatics.com/v2/";
const MATICS_API_KEY = process.env.MATICS_API_KEY;

//connect to websocket
const websocket = new WebSocket(WSS_URL, {
  headers: {
    Authorization: `Bearer ${MATICS_API_KEY}`,
  },
});

//websocket is event-driven, so we need listener. when websocket is open, it will trigger 'open' event
//websocket.addEventListener('open', function(){}) and websocket.onopen = function(){} are for frontend
//websocket.on('open') is for backend event listener
//put websocket in the backend, because we already have audio file in the backend, and don't need to interact with browser

websocket.on("open", function () {
  console.log("WebSocket connection opened");
  //send initial message
  const message = {
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
  websocket.send(JSON.stringify(message));

  //send stream audio data
  const stream = fs.createReadStream("/Users/sunliyuan/Desktop/sample.wav");
  let sequenceNumber = 0;
  stream.on("data", function (chunk) {
    websocket.send(chunk);
    setTimeout(() => {}, 30); //simulate real-time by adding delay
    sequenceNumber++;
  });

  //when audio file is completely read, send end message
  stream.on("end", function () {
    console.log("Audio file completely read");
    const message = {
      message: "EndOfStream",
      last_seq_no: sequenceNumber - 1,
    };
    websocket.send(JSON.stringify(message));
  });
});

//get transcription result
let sentence = "";
const results = [];
websocket.on("message", function (data) {
  try {
    //close connection when receive end of transcript message
    data = JSON.parse(data);
    if (data.message === "EndOfTranscript") {
      console.log("Transcription completed");
      websocket.close();
    }
    if (data.message === "AddTranscript") {
      // console.log(
      //   `start: ${data.metadata.start_time}, end: ${data.metadata.end_time},${data.metadata.transcript}`
      // );
      appendToFullText(data);
    }
  } catch (error) {
    console.error(error);
  }
});

function appendToFullText(msg) {
  const text = msg.metadata.transcript;
  //add new text to sentence
  sentence = sentence + text;

  if (
    text.trim().slice(-1) === "." ||
    text.trim().slice(-1) === "!" ||
    text.trim().slice(-1) === "?"
  ) {
    //add sentence to results if text ends with punctuation
    results.push(sentence.trim());
    console.log("Current full text:", results);
    //clean sentence, so the sentence won't be repeatedly added
    sentence = "";
  }
}

// return { sentenceResult, timeStamps };
// }
