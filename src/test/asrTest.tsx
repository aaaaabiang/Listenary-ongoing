import { useEffect } from "react";
import { speechToText } from "../speechToText.js";

/**
 * ASR Test Component
 * Used for testing speech-to-text functionality
 */
export function AsrTest() {
  useEffect(function testAsrFunction() {
    console.log("AsrTest Component Mounted");
    const audioUrl =
      "https://op3.dev/e/episodes.captivate.fm/episode/4d32de1b-a809-4dce-a053-69a3eb7c3a98.mp3";

    speechToText({
      audioUrl,
      episodeId: `test-${Date.now()}`,
    })
      .then(function (result) {
        console.log("Transcription result", result);
      })
      .catch(function (error) {
        console.error("Transcription failed", error);
      });
  }, []);

  return <div>ASR Test Running...</div>;
}
