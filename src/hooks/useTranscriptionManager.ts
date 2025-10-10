import { useCallback } from "react";
import { speechToText } from "../speechToText.js"; // Backend API
import { resolvePromise } from "../resolvePromise.js";
export function useTranscriptionManager({
  model,
  episode,
  setIsTranscribing,
  setIsLoading,
}) {
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
  const transcribeAudio = useCallback(() => {
    const episodeGuid = model.currentEpisode?.guid || episode?.guid;
    const audioUrl = model.audioUrl;
    if (!audioUrl || !episodeGuid) {
      throw new Error("Missing audio URL or episode GUID for transcription");
    }

    model.transcripResultsPromiseState.error = null;
    model.transcripResultsPromiseState.data = null;

    const prms = speechToText({
      audioUrl,
      episodeId: episodeGuid,
      rssUrl: model.rssUrl,
    })
      .then((data) => ({ ...data, guid: episodeGuid }))
      .catch((error) => {
        if (setIsTranscribing) setIsTranscribing(false);
        if (setIsLoading) setIsLoading(false);
        throw error;
      });

    resolvePromise(prms, model.transcripResultsPromiseState);
    return prms;
  }, [episode, model, setIsLoading, setIsTranscribing]);

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

      try {
        const transcriptionProcess = transcribeAudio();
        transcriptionProcess.finally(function () {
          if (setIsTranscribing) setIsTranscribing(false);
          if (setIsLoading) setIsLoading(false);
        });
      } catch (error: any) {
        console.error("Failed to start transcription:", error.message);
        alert("Transcription start failed, please try again later!");
        if (setIsTranscribing) setIsTranscribing(false);
        if (setIsLoading) setIsLoading(false);
      }
    });
  }, [
    episode,
    model,
    transcribeAudio,
    setIsTranscribing,
    setIsLoading,
  ]);

  return { handleTranscribe };
}
