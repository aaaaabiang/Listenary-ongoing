import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import "../../styles/PodcastPlay.css";


export function TranscriptList({
  transcriptionData,
  currentTime,
  targetLanguage,
  translations,
  translatingItems,
  onWordClick
}) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 自动滚动到当前时间点对应的行
  useEffect(() => {
    if (!transcriptionData.length) return;

    const index = transcriptionData
      .map((item, i) => ({ ...item, i }))
      .filter(item => item.offsetMilliseconds <= currentTime)
      .pop()?.i;

    if (index !== undefined && rowRefs.current[index]) {
      rowRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });
    }
  }, [currentTime, transcriptionData]);

  if (!transcriptionData.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click "Transcribe" to get the transcription of this podcast
      </Typography>
    );
  }

  return (
    <Box className="transcript-content" sx={{ flex: "1 1 auto", overflowY: "auto", pr: 1 }}>
      <div className="transcription-container">
        {transcriptionData.map((item, index) => {
          const start = item.offsetMilliseconds;
          const end =
            index + 1 < transcriptionData.length
              ? transcriptionData[index + 1].offsetMilliseconds
              : Infinity;
          const isActive = currentTime >= start && currentTime < end;

          return (
            <div
              key={"row-" + index}
              ref={(el) => { rowRefs.current[index] = el; }}
              className={"transcript-row " + (isActive ? "active-row" : "")}
            >
              <div className="timestamp-column">{item.timestamp}</div>
              <div className="content-column">
                <div className="transcription-text">
                  {item.text.split(/(\s+)/).map((part, wordIndex) => {
                    if (/\s+/.test(part)) return part;
                    return (
                      <span
                        key={"word-" + wordIndex}
                        className={"word-hover " + (isActive ? "active-word" : "")}
                        onClick={e => onWordClick(part, e)}
                      >
                        {part}
                      </span>
                    );
                  })}
                </div>
                {targetLanguage && (
                  <div className="translation-text">
                    {translatingItems.has(item.text)
                      ? "Loading..."
                      : translations[item.text]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
}
