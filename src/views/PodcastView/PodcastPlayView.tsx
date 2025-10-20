// import "../styles/PodcastPlay.css";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useRef, useEffect } from "react";
import { TopNav } from "@/components/TopNav.jsx";
import AudioPlayerComponent, {
  type AudioPlayerHandle,
} from "@/components/AudioPlayerComponent.jsx";
import { useTranslationHandler } from "@/hooks/useTranslationHandler";
import { Box, ThemeProvider, createTheme, Typography, Skeleton, Card, FormControl, Select, MenuItem, InputLabel} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import { PodcastInfoCard } from "./PodcastInfoCard.jsx";
import { TranscriptList } from "./TranscriptList";
import { DictionaryCard } from "./DictionaryCard";
import type { SelectChangeEvent } from "@mui/material/Select"; 


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
  infoLoading = false,      
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
  const internalAudioRef = useRef<AudioPlayerHandle | null>(null); 
  

  useEffect(() => {
    return () => {
      if (internalAudioRef.current && internalAudioRef.current.pause) {
        internalAudioRef.current.pause();
        (internalAudioRef.current as any).currentTime = 0;
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

    const initialLeft = rect.right + CARD_MARGIN;
    const fallbackLeft = Math.max(rect.left - CARD_WIDTH - CARD_MARGIN, 10);
    const left =
      initialLeft + CARD_WIDTH > windowWidth
        ? fallbackLeft
        : Math.max(initialLeft, 10);

    const spaceBelow = windowHeight - rect.bottom - CARD_BOTTOM_SAFE;
    const downPlacement = Math.max(rect.bottom + CARD_MARGIN, 10);
    const upPlacement = Math.max(rect.top - CARD_HEIGHT - CARD_MARGIN, 10);
    const top = spaceBelow >= CARD_HEIGHT ? downPlacement : upPlacement;

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
          mb: "110px",
        }}
      >
        {/* Left panel with podcast info */}
        {infoLoading ? (
          <Card sx={{ borderRadius: 3, flexShrink: 0, flexBasis: { md: "35%", xs: "100%" } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                p: 2,
              }}
            >
              <Skeleton
                variant="rectangular"
                width={160}
                height={160}
                sx={{ borderRadius: 2, flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton variant="text" width="70%" height={36} />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="85%" />
                <Skeleton
                  variant="rectangular"
                  width={140}
                  height={36}
                  sx={{ borderRadius: 2, mt: 1 }}
                />
              </Box>
            </Box>
          </Card>
        ) : (
          <PodcastInfoCard
            podcastData={podcastData}
            isTranscribing={isTranscribing}
            onTranscribe={onTranscribe}
          />
        )}

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
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="lang-label">Language</InputLabel>
                <Select
                  labelId="lang-label"
                  id="lang-select"
                  value={targetLanguage}
                  label="Language"
                  onChange={handleLanguageChange}
                  MenuProps={{
                    slotProps: { paper: { sx: { borderRadius: 2 } } }, 
                  }}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              height: "auto",
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
                audioSrc={podcastData.audioUrl}
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
