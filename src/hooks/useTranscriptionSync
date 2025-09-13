import { useEffect } from "react";
import { saveTranscriptionData } from "../firestoreModel";
import loginModel from "../loginModel";

/**
 * Hook to handle transcription state change and sync with Firestore
 */
export function useTranscriptionSync({
  model,
  episode,
  data,
  error,
  setIsTranscribing,
  setIsLoading,
}) {
  useEffect(() => {
    if (data && data.guid === episode?.guid) {
      console.log("Setting transcription results:", data.phrases);
      model.setResults(data.phrases);
      setIsTranscribing(false);
      setIsLoading(false);

      const user = loginModel.getUser();
      if (user && episode?.guid) {
        saveTranscriptionData(
          user.uid,
          episode.guid,
          episode.title,
          data.phrases
        ).then(() => {
          const event = new CustomEvent("transcriptionComplete", {
            detail: { guid: episode.guid },
          });
          window.dispatchEvent(event);
        });
      }
    }
  }, [data, error, episode]);
}

//   //address race condition
//   const guid = episode?.guid;
//   const data = props.model.transcripResultsPromiseState.data;
//   const error = props.model.transcripResultsPromiseState.error;

//   useEffect(() => {
//     console.log("useEffect triggered", { data, guid, episode });
//     if (data && data.guid === guid) {
//       console.log("Setting results:", data.phrases);
//       props.model.setResults(data.phrases);
//       setIsTranscribing(false);
//       setIsLoading(false);

//       // Save transcription data and dispatch event
//       const user = loginModel.getUser();
//       if (user && episode?.guid) {
//         saveTranscriptionData(
//           user.uid,
//           episode.guid,
//           episode.title,
//           data.phrases
//         ).then(function () {
//           console.log("Transcription saved, dispatching event...");
//           const event = new CustomEvent("transcriptionComplete", {
//             detail: { guid: episode.guid },
//           });
//           window.dispatchEvent(event);
//         });
//       }
//     }
//   }, [data, error, guid]);