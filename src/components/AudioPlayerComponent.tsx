import {
  Box,
  Slider,
  IconButton,
  Typography,
  Stack,
  Popper,
  ClickAwayListener,
  Button,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Forward10,
  Replay10,
} from "@mui/icons-material";
import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
} from "react";
import { useTheme } from "@mui/material/styles";
import WaveSurfer from "wavesurfer.js";

/** props 类型：音频地址 + 时间更新回调 */
type Props = {
  /** 要播放的音频文件 URL */
  audioSrc: string;
  /** 当前播放时间（毫秒）更新时触发，可选 */
  onTimeUpdate?: (timeMs: number) => void;
};

/** ref 暴露给父组件的控制方法 */
export type AudioPlayerHandle = {
  pause: () => void;
};


const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const AudioPlayerComponent = forwardRef<AudioPlayerHandle, Props>(
  ({ audioSrc, onTimeUpdate }, ref) => {
  const theme = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null); // 指定 WaveSurfer 类型

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volumeAnchorEl, setVolumeAnchorEl] = useState(null);
  const [speedAnchorEl, setSpeedAnchorEl] = useState(null);
  const [waveformLoading, setWaveformLoading] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // 创建代理音频URL的函数
  const createProxyAudioUrl = (originalUrl: string) => {
    // 如果已经是代理URL，直接返回
    if (originalUrl.includes('/api/audio-proxy')) {
      return originalUrl;
    }
    // 创建代理URL
    return `http://localhost:3000/api/audio-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  // 初始化 wavesurfer
  useEffect(() => {
    if (!waveformRef.current) return;
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }
    
    setWaveformLoading(true);
    setAudioError(null);
    
    // 使用代理URL
    const proxyAudioSrc = createProxyAudioUrl(audioSrc);
    
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#b3c7f9",
      progressColor: "#1976d2",
      height: 50,
      // responsive: true,
      barWidth: 2,
      barRadius: 2,
      cursorColor: "#1976d2",
    });
    
    wavesurfer.current.load(proxyAudioSrc);

    wavesurfer.current.on("ready", () => {
      setDuration(wavesurfer.current.getDuration());
      setWaveformLoading(false);
      setAudioError(null);
    });

    wavesurfer.current.on("error", (error) => {
      console.error('WaveSurfer error:', error);
      setAudioError('音频加载失败，请检查网络连接或音频文件是否有效');
      setWaveformLoading(false);
    });

    wavesurfer.current.on("audioprocess", () => {
      const t = wavesurfer.current.getCurrentTime();
      setCurrentTime(t);
      if (onTimeUpdate) {
        onTimeUpdate(t * 1000);
      }
    });

    wavesurfer.current.on("interaction", () => { 
      const t = wavesurfer.current.getCurrentTime();
      setCurrentTime(t);
      if (onTimeUpdate) {
        onTimeUpdate(t * 1000);
      }
    });

    wavesurfer.current.on("play", () => setPlaying(true));
    wavesurfer.current.on("pause", () => setPlaying(false));

    // 保持音量和倍速同步
    wavesurfer.current.setVolume(volume);
    wavesurfer.current.setPlaybackRate(playbackRate);

    return () => {
      wavesurfer.current && wavesurfer.current.destroy();
    };
    // eslint-disable-next-line
  }, [audioSrc]);

  // 音量和倍速变化时同步到 wavesurfer
  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(volume);
    }
  }, [volume]);
  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  useImperativeHandle(ref, () => ({
    pause: () => {
      wavesurfer.current && wavesurfer.current.pause();
      setPlaying(false);
    },
  }));

  // 控制
  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const handleSliderChange = (_, value) => {
    if (wavesurfer.current) {
      wavesurfer.current.seekTo(value / duration);
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (_, value) => {
    setVolume(value);
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    setSpeedAnchorEl(null);
  };

  const handleForward = () => {
    if (wavesurfer.current) {
      const t = Math.min(currentTime + 10, duration);
      wavesurfer.current.seekTo(t / duration);
      setCurrentTime(t);
    }
  };
  const handleReplay = () => {
    if (wavesurfer.current) {
      const t = Math.max(currentTime - 10, 0);
      wavesurfer.current.seekTo(t / duration);
      setCurrentTime(t);
    }
  };

  return (
    <Box
      sx={{
        borderRadius: 10,
        px: 6,
        py: 2,
        bgcolor: "#fff",
        boxShadow: 1,
        width: "100%",
        gap: 2,
      }}
    >
      {/* 时间 + 波形图 */}
      <Box sx={{ display: "flex", alignItems: "center", width: "100%", mb: 1 }}>
        <Typography variant="caption" sx={{ minWidth: 40 }}>
          {formatTime(0)}
        </Typography>
        <Box sx={{ flexGrow: 1, position: "relative" }}>
          <div ref={waveformRef} style={{ width: "100%" }} />
          {waveformLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Loading...
              </Typography>
            </Box>
          )}
          {audioError && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(255,255,255,0.9)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                p: 2,
              }}
            >
              <Typography variant="caption" color="error" sx={{ mb: 1 }}>
                {audioError}
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => {
                  setAudioError(null);
                  if (wavesurfer.current) {
                    wavesurfer.current.load(createProxyAudioUrl(audioSrc));
                  }
                }}
              >
                重试
              </Button>
            </Box>
          )}
        </Box>
        <Typography variant="caption" sx={{ minWidth: 40, textAlign: "right" }}>
          {formatTime(duration)}
        </Typography>
      </Box>

      {/* 控制条 */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
      >
        <IconButton onClick={handleReplay} sx={{ color: "#485D92" }}>
          <Replay10 />
        </IconButton>

        <IconButton onClick={togglePlay} color="primary">
          {playing ? <Pause /> : <PlayArrow />}
        </IconButton>

        <IconButton onClick={handleForward} sx={{ color: "#485D92" }}>
          <Forward10 />
        </IconButton>

        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Button
            variant="text"
            size="small"
            onClick={function() {
              setShowSpeedMenu(!showSpeedMenu);
            }}
            sx={{
              minWidth: "auto",
              px: 1,
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            {playbackRate}x
          </Button>
          {showSpeedMenu && (
            <Box
              sx={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "background.paper",
                borderRadius: 1,
                boxShadow: 3,
                p: 1,
                zIndex: 1400,
                mb: 1,
                minWidth: 100,
              }}
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(function(speed) {
                return (
                  <Button
                    key={speed}
                    fullWidth
                    size="small"
                    onClick={function() {
                      handleSpeedChange(speed);
                      setShowSpeedMenu(false);
                    }}
                    sx={{
                      justifyContent: "flex-start",
                      color: speed === playbackRate ? "primary.main" : "text.primary",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {speed}x
                  </Button>
                );
              })}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={function(e) {
              setVolumeAnchorEl(volumeAnchorEl ? null : e.currentTarget);
            }}
            sx={{ color: "#485D92" }}
          >
            {volume > 0 ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
          {Boolean(volumeAnchorEl) && (
            <Box
              sx={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "background.paper",
                borderRadius: 1,
                boxShadow: 3,
                p: 2,
                zIndex: 1400,
                mb: 1,
                minWidth: 120,
              }}
            >
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.01}
                orientation="vertical"
                sx={{
                  height: 100,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                  },
                  '& .MuiSlider-track': {
                    width: 4,
                  },
                  '& .MuiSlider-rail': {
                    width: 4,
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
});

export default AudioPlayerComponent;
