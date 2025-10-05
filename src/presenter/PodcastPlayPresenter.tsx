import { observer } from "mobx-react-lite";
import { PodcastPlayView } from "../views/PodcastView/PodcastPlayView";
import AudioPlayer from "../components/AudioPlayerComponent";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { useTranscriptionSync } from "../hooks/useTranscriptionSync";
import { useWordLookup } from "../hooks/useWordLookup";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {getTranscriptionData} from "../firestoreModel"; // Import the Firestore function
import loginModel from "../loginModel"; // Import login model to check user status
import { useTranscriptionManager } from "../hooks/useTranscriptionManager";

const PodcastPlayPresenter = observer(function PodcastPlayPresenter(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const episode =
    props.model.currentEpisode ||
    JSON.parse(localStorage.getItem("currentEpisode"));
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioRef = useRef(null);
  const currentTime = useAudioPlayback(audioRef);
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
    props.model.transcripResultsPromiseState.error = null;
    props.model.transcripResultsPromiseState.data = null;

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

  function getTimestamp(phrase) {
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
  function getSentence(phrase) {
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
    return {
      title: episode.title,
      description: episode.description,
      audioUrl: props.model.audioUrl,
      duration: episode.duration,
      source: props.model?.podcastChannelInfo?.title || "Podcast",
      coverImage: episode.image,
    };
  }

  return (
    <PodcastPlayView
      podcastData={getPodcastData()}
      audioDuration={props.model.audioDuration}
      transcriptionData={processedTranscriptionData}
      wordCard={wordCard}
      AudioPlayerComponent={AudioPlayer}
      audioSrc={props.model.audioUrl}
      audioRef={audioRef}
      onWordSelect={handleWordSelect}
      onTranscribe={handleTranscribe}
      isLoading={isLoading}
      isTranscribing={isTranscribing}
      currentTime={currentTime}
      // onTimeUpdate={handleTimeUpdate}
      onAddToWordlist={handleAddToWordlist} // Pass wordlist handler to View
    />
  );
});

export default PodcastPlayPresenter;
