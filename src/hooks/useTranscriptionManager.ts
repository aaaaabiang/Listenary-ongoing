import { useCallback } from "react";
import { AUDIO_DOWNLOAD_URL } from "../../listenary-backend/config/apiConfig.js";
import { speechToText } from "../speechToText.js"; // API HERE
import { resolvePromise } from "../resolvePromise.js";
// import { PROXY_URL, AUDIO_DOWNLOAD_URL } from "../apiConfig"; // Proxy URL
export function useTranscriptionManager({
  model,
  episode,
  setIsTranscribing,
  setIsLoading,
}) {
  //     //download audio file from url
  //   function downloadAndStoreAudioFile(audioUrl) {
  //     const proxyUrl = `${AUDIO_DOWNLOAD_URL}?url=${encodeURIComponent(
  //       audioUrl
  //     )}`;
  //     console.log("Proxy URL:", proxyUrl);
  //     return fetch(proxyUrl)
  //       .then(function (response) {
  //         if (response.status !== 200) throw new Error(response.status);
  //         return response.blob();
  //       })
  //       .then(function (blob) {
  //         console.log("Blob type:", blob.type);
  //         console.log("Blob size:", blob.size);

  //         const audioFile = new File([blob], "audio.wav", {
  //           type: blob.type || "audio/wav",
  //         });

  //         console.log("Downloaded audio file:", audioFile);
  //         return audioFile;
  //       });
  //   }
  const downloadAndStoreAudioFile = useCallback(async (audioUrl) => {
    const proxyUrl = `${AUDIO_DOWNLOAD_URL}?url=${encodeURIComponent(
      audioUrl
    )}`;
    const response = await fetch(proxyUrl);
    if (response.status !== 200)
      throw new Error(`HTTP error: ${response.status}`);

    const blob = await response.blob();
    return new File([blob], "audio.wav", {
      type: blob.type || "audio/wav",
    });
  }, []);

  // //request transcription api
  // function transcribeAudio(audioFile) {
  //   console.log("Transcribing audio file:", audioFile);
  //   console.log("audio file type:", audioFile.type);
  //   if (!audioFile) {
  //     console.error("No audio file provided to transcribeAudio");
  //     alert("Invalid audio file, please try another!");
  //     setIsTranscribing(false);
  //     return;
  //   }

  //   const params = {
  //     audio: audioFile,
  //     definition: JSON.stringify({ locales: ["en-US"] }),
  //   };

  //   console.log("Calling speechToText with params:", params);

  //   props.model.transcripResultsPromiseState.error = null;
  //   props.model.transcripResultsPromiseState.data = null;

  //   const prms = speechToText(params)
  //     .then((data) => {
  //       // add guid
  //       return { ...data, guid: props.model.currentEpisode.guid };
  //     })
  //     .catch((error) => {
  //       setIsTranscribing(false);
  //       setIsLoading(false);
  //       throw error;
  //     });

  //   resolvePromise(prms, props.model.transcripResultsPromiseState);
  // }

  const transcribeAudio = useCallback(
    (audioFile) => {
      const params = {
        audio: audioFile,
        definition: JSON.stringify({ locales: ["en-US"] }),
      };

      model.transcripResultsPromiseState.error = null;
      model.transcripResultsPromiseState.data = null;

      const prms = speechToText(params)
        .then((data) => ({ ...data, guid: model.currentEpisode.guid }))
        .catch((error) => {
          setIsTranscribing(false);
          setIsLoading(false);
          throw error;
        });

      resolvePromise(prms, model.transcripResultsPromiseState);
    },
    [model, setIsTranscribing, setIsLoading]
  );

  // function handleTranscribe() {
  // console.log("Transcribe button clicked");
  // if (!episode || !props.model.audioUrl) {
  //   alert("Invalid episode data");
  //   return;
  // }

  // if (isTranscribing) {
  //   console.log("Transcription is already in progress.");
  //   return;
  // }

  // setIsTranscribing(true);
  // setIsLoading(true);

  // if (
  //   props.model.transcripResults &&
  //   props.model.transcripResults.length > 0
  // ) {
  //   console.log("Transcription already exists, skipping API request.");
  //   alert("This episode has already been transcribed.");
  //   setIsTranscribing(false);
  //   return;
  // }

  //   // 提取转录文本
  //   function getSentence(phrase) {
  //     return phrase.text || "No text available";
  //   }

  //     const audio = new Audio(props.model.audioUrl);
  //     audio.addEventListener("loadedmetadata", function () {
  //       const duration = audio.duration;
  //       if (duration > 1800) {
  //         alert(
  //           "please select a shorter espisode less than 30 minutes to save usage for us :)"
  //         );
  //         setIsLoading(false);
  //         setIsTranscribing(false);
  //         return;
  //       }

  //       props.model.setAudioDuration(duration);

  //       if (props.model.audioFile) {
  //         console.log("Using existing audio file:", props.model.audioFile);
  //         transcribeAudio(props.model.audioFile);
  //       } else {
  //         console.log("Downloading audio file...");
  //         console.log("Audio URL:", props.model.audioUrl);

  //         downloadAndStoreAudioFile(props.model.audioUrl)
  //           .then(function (audioFile) {
  //             props.model.setAudioFile(audioFile);
  //             transcribeAudio(audioFile);
  //           })
  //           .catch(function (error) {
  //             console.error("Failed to download audio file:", error.message);
  //             alert("Audio download failed, please try again later!");
  //             setIsTranscribing(false);
  //           })
  //           .finally(function () {
  //             setIsLoading(false);
  //           });
  //       }
  //     });
  //   },
  //   // Remove the old saveTranscripDataACB function since we're handling it in the useEffect
  //   function saveTranscripDataACB(data) {
  //     if (data) {
  //       const newResults = data.phrases;
  //       const updatedResults = props.model.transcripResults.concat(newResults);
  //       props.model.setResults(updatedResults);
  //     } else {
  //       console.log("API returned empty data");
  //     }
  //     setIsTranscribing(false);
  //   }
  const handleTranscribe = useCallback(() => {
    if (!episode || !model.audioUrl) {
      alert("Invalid episode data");
      return;
    }

    if (setIsTranscribing) setIsTranscribing(true);
    if (setIsLoading) setIsLoading(true);

    if (model.transcripResults?.length > 0) {
      alert("This episode has already been transcribed.");
      if (setIsTranscribing) setIsTranscribing(false);
      return;
    }

    const audio = new Audio(model.audioUrl);
    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration;
      if (duration > 1800) {
        alert("Please select a shorter episode (less than 30 minutes).");
        if (setIsLoading) setIsLoading(false);
        if (setIsTranscribing) setIsTranscribing(false);
        return;
      }

      model.setAudioDuration(duration);

      if (model.audioFile) {
        transcribeAudio(model.audioFile);
      } else {
        downloadAndStoreAudioFile(model.audioUrl)
          .then((audioFile) => {
            model.setAudioFile(audioFile);
            transcribeAudio(audioFile);
          })
          .catch((error) => {
            console.error("Failed to download audio file:", error.message);
            alert("Audio download failed, please try again later!");
            if (setIsTranscribing) setIsTranscribing(false);
          })
          .finally(() => {
            if (setIsLoading) setIsLoading(false);
          });
      }
    });
  }, [
    episode,
    model,
    transcribeAudio,
    downloadAndStoreAudioFile,
    setIsTranscribing,
    setIsLoading,
  ]);

  return { handleTranscribe };
}
