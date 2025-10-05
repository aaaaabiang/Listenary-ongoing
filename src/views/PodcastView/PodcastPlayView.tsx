// import "../styles/PodcastPlay.css";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useRef, useEffect } from "react";
import { AUDIO_DOWNLOAD_URL } from "../../../listenary-backend/config/apiConfig.js";
import { TopNav } from "../../components/TopNav.jsx";
import AudioPlayerComponent from "../../components/AudioPlayerComponent.jsx";
import { useTranslationHandler } from "../../hooks/useTranslationHandler";
import { Box, ThemeProvider, createTheme, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import { PodcastInfoCard } from "./PodcastInfoCard.jsx";
import { TranscriptList } from "./TranscriptList";
import { DictionaryCard } from "./DictionaryCard";

const theme = createTheme();

export function PodcastPlayView({
  podcastData,
  onTimeUpdate,
  transcriptionData = [],
  onWordSelect,
  onTranscribe,
  isTranscribing,
  currentTime,
  wordCard,
  onAddToWordlist,
}) {
  const [showDictionary, setShowDictionary] = useState(false);
  const [dictionaryPosition, setDictionaryPosition] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [translations, setTranslations] = useState({});
  const [translatingItems, setTranslatingItems] = useState(new Set());
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const rowRefs = useRef([]);
  const phoneticAudioRef = useRef(null);
  const internalAudioRef = useRef();

  useEffect(() => {
    return () => {
      if (internalAudioRef.current && internalAudioRef.current.pause) {
        internalAudioRef.current.pause();
        internalAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(
    function setupAutoScroll() {
      if (!transcriptionData.length) return;

      function findCurrentIndex() {
        return transcriptionData
          .map(function (item, i) {
            return { ...item, i };
          })
          .filter(function (item) {
            return item.offsetMilliseconds <= currentTime;
          })
          .pop()?.i;
      }

      const index = findCurrentIndex();
      if (index !== undefined && rowRefs.current[index]) {
        rowRefs.current[index].scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    },
    [currentTime, transcriptionData]
  );

  const languages = [
    { code: "", name: "Translation Language" },
    { code: "ZH-HANS", name: "中文" },
    { code: "DE", name: "Deutsch" },
    { code: "SV", name: "Svenska" },
    { code: "FR", name: "Français" },
    { code: "NL", name: "Nederlands" },
  ];

  const { handleLanguageChange } = useTranslationHandler({
    transcriptionData,
    setTargetLanguage,
    setTranslations,
    setTranslatingItems,
  });

  const handleWordClick = (word, event) => {
    const CARD_WIDTH = 400;
    const CARD_HEIGHT = 320;
    const CARD_MARGIN = 10;
    const PLAYER_HEIGHT = 90;
    const CARD_BOTTOM_SAFE = PLAYER_HEIGHT + 48;
    const rect = event.target.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = rect.right + CARD_MARGIN;
    if (left + CARD_WIDTH > windowWidth) {
      left = rect.left - CARD_WIDTH - CARD_MARGIN;
      if (left < 10) left = 10;
    }

    let top;
    const spaceBelow = windowHeight - rect.bottom - CARD_BOTTOM_SAFE;
    if (spaceBelow >= CARD_HEIGHT) {
      top = rect.bottom + CARD_MARGIN;
    } else {
      top = rect.top - CARD_HEIGHT - CARD_MARGIN;
      if (top < 10) top = 10;
    }

    setDictionaryPosition({ top, left });
    setShowDictionary(true);
    onWordSelect(word);
  };

  const handleAddToWordlist = useCallback(async () => {
    const result = await onAddToWordlist(wordCard);
    // Show specific notification based on login and save status
    if (result.type === "warning") {
      showNotification("Please login first to save your wordlist", "warning");
    } else if (result.type === "success") {
      showNotification("saved to the default wordlist", "success");
    } else {
      showNotification(result.message, result.type || "info");
    }
    setShowDictionary(false);
  }, [wordCard, onAddToWordlist]);

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "info" }),
      3000
    );
  };

  const playPhoneticAudio = (url) => {
    if (!url) return;
    if (phoneticAudioRef.current) {
      phoneticAudioRef.current.src = url;
      phoneticAudioRef.current.play();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        className="podcast-page"
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <TopNav />
        <Box
          sx={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            maxWidth: 1400,
            mx: "auto",
            px: 1,
            pt: 0,
            pb: 0,
            gap: 2.5,
            width: "85%",
            overflow: "hidden",
            // height: "calc(100vh - 64px - 75px)",
            mt: "24px",
            mb: "90px",
          }}
        >
          {/* Left panel with podcast info */}
          <PodcastInfoCard
            podcastData={podcastData}
            isTranscribing={isTranscribing}
            onTranscribe={onTranscribe}
          />

          {/* Right panel with transcription */}
          <Box
            className="right-panel"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              height: "95%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Fixed header */}
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                minWidth: "500px",
                position: "sticky",
                top: 0,
                zIndex: 1,
                px: 1,
                py: 1,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Transcription
              </Typography>

              {/* Translation language selector, only shown when transcription exists */}
              {transcriptionData.length > 0 && (
                <Box sx={{ minWidth: 200 }}>
                  <select
                    value={targetLanguage}
                    onChange={handleLanguageChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {languages.map(function (lang) {
                      return (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      );
                    })}
                  </select>
                </Box>
              )}
            </Box>

            {/* Scrollable transcript content */}
            <TranscriptList
              transcriptionData={transcriptionData}
              currentTime={currentTime}
              targetLanguage={targetLanguage}
              translations={translations}
              translatingItems={translatingItems}
              onWordClick={handleWordClick}
            />
            {/* Fixed bottom player area */}
            <Box
              sx={{
                position: "fixed",
                left: 0,
                bottom: 0,
                width: "100%",
                height: "aoto",
                zIndex: 1200,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 1400,
                  px: 2,
                }}
              >
                <AudioPlayerComponent
                  ref={internalAudioRef}
                  audioSrc={`${AUDIO_DOWNLOAD_URL}?url=${encodeURIComponent(
                    podcastData.audioUrl
                  )}`}
                  onTimeUpdate={onTimeUpdate}
                />
              </Box>
            </Box>

            {/* Dictionary card */}
            {showDictionary && (
              <DictionaryCard
                wordCard={{ ...wordCard, position: dictionaryPosition }}
                onClose={() => setShowDictionary(false)}
                onAddToWordlist={handleAddToWordlist}
              />
            )}

            {notification.show && (
              <div className={`notification-toast ${notification.type}`}>
                {notification.message}
              </div>
            )}
          </Box>
        </Box>
      </div>
    </ThemeProvider>
  );
}
