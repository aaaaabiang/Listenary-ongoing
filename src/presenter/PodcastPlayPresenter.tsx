import { observer } from "mobx-react-lite";
import { PodcastPlayView } from "../views/PodcastView/PodcastPlayView";
import { useCallback, useEffect, useState } from "react";
import { useTranscriptionSync } from "../hooks/useTranscriptionSync";
import { useWordLookup } from "../hooks/useWordLookup";
import { useNavigate } from "react-router-dom";
import {getTranscriptionData} from "../firestoreModel"; // Import the Firestore function
import loginModel from "../loginModel"; // Import login model to check user status
import { useTranscriptionManager } from "../hooks/useTranscriptionManager";
import { runInAction } from "mobx";

type Props = { model: any };                               

const PodcastPlayPresenter = observer(function PodcastPlayPresenter(
  props: Props                                                              // [fix: annotate props with Props]
) {
  const navigate = useNavigate();
  const episode =
    props.model.currentEpisode ||
    JSON.parse(localStorage.getItem("currentEpisode"));
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { handleTranscribe } = useTranscriptionManager({
    model: props.model,
    episode,
    setIsTranscribing,
    setIsLoading,
  });
  const processedTranscriptionData = processTranscriptionData();
  const data = props.model.transcripResultsPromiseState.data;
  const error = props.model.transcripResultsPromiseState.error;
  const { wordCard, handleWordSelect, handleAddToWordlist } = useWordLookup(props.model);

  // set current episode from localStorage
  useEffect(() => {
    if (!props.model.currentEpisode) {
      const localEpisode = JSON.parse(localStorage.getItem("currentEpisode"));
      if (localEpisode) {
        props.model.setCurrentEpisode(localEpisode);
      }
    }
  }, []);


  // Save current episode to localStorage
  useEffect(
    function saveCurrentEpisode() {
      if (episode) {
        localStorage.setItem("currentEpisode", JSON.stringify(episode));
      }
    },
    [episode]
  );

  useEffect(() => {
    // clear transcription results
    runInAction(() => {
      props.model.transcripResultsPromiseState.error = null;
      props.model.transcripResultsPromiseState.data = null;
    });

    if (!episode) return;
    console.log("Episode changed to:", episode.title);
    props.model.setResults([]);
    props.model.setAudioDuration(0);
    props.model.setAudioFile(null);

    async function fetchTranscriptFromFirestore() {
      const user = loginModel.getUser();
      if (user && episode?.guid) {
        const phrases = await getTranscriptionData(user.uid, episode.guid);
        if (phrases.length > 0) {
          props.model.setResults(phrases);
        }
      }
    }
    fetchTranscriptFromFirestore();
  }, [props.model.currentEpisode]);

  function getTimestamp(phrase: any) {
    const totalMilliseconds = phrase.offsetMilliseconds || 0;
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  // Extract the transcribed text
  function getSentence(phrase: any) {
    return phrase.text || "No text available";
  }

  function processTranscriptionData() {
    const results = [];
    for (let i = 0; i < props.model.transcripResults.length; i++) {
      const phrase = props.model.transcripResults[i];
      results.push({
        timestamp: getTimestamp(phrase),
        text: getSentence(phrase),
        offsetMilliseconds: phrase.offsetMilliseconds || 0,
      });
    }
    return results;
  }

  const handleTimeUpdate = useCallback((timeMs: number) => {
    setCurrentTime(timeMs);
  }, []);

  useTranscriptionSync({
    model: props.model,
    episode,
    data,
    error,
    setIsTranscribing,
    setIsLoading,
  });

  //back to channel page
  function handleBack() {
    navigate("/podcast-channel");
  }
  if (!episode) {
    return (
      <div style={{ padding: "2rem" }}>
        {" "}
        <p>No episode data</p> <button onClick={handleBack}>← Back</button>{" "}
      </div>
    );
  }

  function getPodcastData() {
    // Handle case where image might be an array
    const getCoverImage = () => {
      if (!episode.image) return "";
      if (Array.isArray(episode.image)) {
        return episode.image[0] || "";
      }
      return episode.image;
    };

    return {
      title: episode.title,
      description: episode.description,
      audioUrl: props.model.audioUrl,
      duration: episode.duration,
      source: props.model?.podcastChannelInfo?.title || "Podcast",
      coverImage: getCoverImage(),
    };
  }

  return (
    <PodcastPlayView
      podcastData={getPodcastData()}
      onTimeUpdate={handleTimeUpdate}
      // audioDuration={props.model.audioDuration}
      transcriptionData={processedTranscriptionData}
      wordCard={wordCard}
      // AudioPlayerComponent={AudioPlayer}
      // audioSrc={props.model.audioUrl}
      onWordSelect={handleWordSelect}
      onTranscribe={handleTranscribe}
      // isLoading={isLoading}
      isTranscribing={isTranscribing}
      currentTime={currentTime}
      // onTimeUpdate={handleTimeUpdate}
      onAddToWordlist={handleAddToWordlist} // Pass wordlist handler to View
    />
  );
});

export default PodcastPlayPresenter;
