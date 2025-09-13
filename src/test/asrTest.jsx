import { useEffect } from "react";
import { speechToText } from "../speechToText.js";
import { PROXY_URL } from "../apiConfig.js";

/**
 * ASR Test Component
 * Used for testing speech-to-text functionality
 */
export function AsrTest() {
  useEffect(function testAsrFunction() {
    console.log("AsrTest Component Mounted");
    const audioUrl = "https://crbn.us/whatstheweatherlike.wav";
    const proxyUrl = `${PROXY_URL}/proxy?url=${encodeURIComponent(audioUrl)}`;

    // Download audio and transcribe
    fetch(proxyUrl)
      .then(function handleResponse(response) {
        if (response.status !== 200) throw new Error(response.status);
        return response.blob();
      })
      .then(function processAudio(blob) {
        var audioFile = new File([blob], "audio.wav", { type: blob.type });
        var params = {
          audio: audioFile,
          definition: JSON.stringify({ locales: ["en-US"] }),
        };
        // Request speech-to-text API
        speechToText(params);
      })
      .catch(function handleError(error) {
        console.error("Fail", error.message);
      });
  }, []);

  return <div>ASR Test Running...</div>;
} 