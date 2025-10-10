type SpeechToTextParams = {
  audioUrl: string;
  episodeId: string;
  rssUrl?: string;
};

export function speechToText(params: SpeechToTextParams) {
  const { audioUrl, episodeId, rssUrl } = params;
  if (!audioUrl || !episodeId) {
    return Promise.reject(new Error("audioUrl and episodeId are required"));
  }

  return fetch("/api/transcriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audioUrl,
      episodeId,
      rssUrl,
    }),
  }).then(function (response) {
    if (!response.ok) {
      throw new Error(`Transcription API failed: ${response.status}`);
    }
    return response.json();
  });
}
