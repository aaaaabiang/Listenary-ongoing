// import { model } from "./Model.js";
import { model } from "./Model.js";
import { AZURE_API_URL, AZURE_API_KEY, PROXY_URL } from "./apiConfig.js";

// export function speechToText(params) {
// Rewrite original method: Replace FormData with JSON request body, use audio URL
export function speechToText(params) {
  const { audio, definition } = params;
  // Create FormData object to store audio file and definition parameters
  const formData = new FormData();
  if (params.audio) {
    formData.append("audio", audio); // Appends "audio" as a new parameter.
  }
  if (params.definition) {
    formData.append("definition", definition); // Appends "definition" as a new parameter.
  } // Send request
  return fetch(
    `${PROXY_URL}?url=${encodeURIComponent(
      AZURE_API_URL +
        "/speechtotext/transcriptions:transcribe?api-version=2024-11-15"
    )}`, // New URL
    {
      method: "POST",
      body: formData,
    }
  )
    .then(gotResponseACB) // Convert response data to JSON
    .catch(function (error) {
      console.error("Fail to upload or transcribe", error.message);
    });

  function gotResponseACB(response) {
    // Change 7: Check status, provide more user-friendly error messages
    if (!response.ok)
      throw new Error(`Transcription API failed: ${response.status}`);
    return response.json();
  }
}
