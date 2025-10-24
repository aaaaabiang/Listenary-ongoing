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
import { API_BASE_URL } from "../config/apiConfig"; // ← 路径按你的目录层级调整
import { keyframes } from "@mui/system";

const waveBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: .6; }
  40% { transform: translateY(-4px); opacity: 1; }
`;

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
  const abortControllerRef = useRef<AbortController | null>(null); // 添加 AbortController 引用

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  // 锚点元素（用于 Popper）
  const [volumeAnchorEl, setVolumeAnchorEl] = useState<HTMLElement | null>(null);
  const [speedAnchorEl, setSpeedAnchorEl] = useState<HTMLElement | null>(null);

  const [waveformLoading, setWaveformLoading] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);

  // 创建代理音频URL的函数
  const createProxyAudioUrl = (originalUrl: string) => {
    // 检查 originalUrl 是否存在
    if (!originalUrl) {
      return "";
    }
    // 已经是代理URL就直接返回
    if (originalUrl.includes("/api/transcriptions/audio-proxy")) {
      return originalUrl;
    }
    
    // 在生产环境中使用完整的API URL
    if (import.meta.env.PROD) {
      const baseUrl = API_BASE_URL || 'https://listenary-ongoing.onrender.com';
      return `${baseUrl}/api/transcriptions/audio-proxy?url=${encodeURIComponent(originalUrl)}`;
    }
    
    // 开发环境使用相对路径
    return `/api/transcriptions/audio-proxy?url=${encodeURIComponent(originalUrl)}`;
  };
  
  
  // 初始化 wavesurfer
  useEffect(() => {
    if (!waveformRef.current || !audioSrc) return;
    
    // 清理之前的实例
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }
    
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();
    
    setWaveformLoading(true);
    setAudioError(null);
    
    // 使用代理URL
    const proxyAudioSrc = createProxyAudioUrl(audioSrc);
    
    // 如果代理URL为空，不创建WaveSurfer实例
    if (!proxyAudioSrc) {
      setWaveformLoading(false);
      setAudioError('No audio source provided');
      return;
    }
    
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
    
    // 安全地加载音频，处理 AbortError
    try {
      wavesurfer.current.load(proxyAudioSrc);
    } catch (error) {
      // 如果加载失败，检查是否是 AbortError
      if (error instanceof Error && error.name === 'AbortError') {
        // AbortError 是正常的，不需要显示错误
        return;
      }
      console.error('WaveSurfer load error:', error);
      
      // 如果是代理错误，尝试直接使用原始URL
      if (proxyAudioSrc.includes('/api/transcriptions/audio-proxy')) {
        console.log('Audio proxy failed, trying direct URL:', audioSrc);
        try {
          wavesurfer.current.load(audioSrc);
        } catch (directError) {
          console.error('Direct audio load also failed:', directError);
          setAudioError('Failed to load audio - proxy and direct access both failed');
          setWaveformLoading(false);
        }
      } else {
        setAudioError('Audio loading failed, please check network connection or audio file validity');
        setWaveformLoading(false);
      }
    }

    wavesurfer.current.on("ready", () => {
      // 检查是否已被取消
      if (abortControllerRef.current?.signal.aborted) return;
      
      setDuration(wavesurfer.current!.getDuration());
      setWaveformLoading(false);
      setAudioError(null);
    });

    wavesurfer.current.on("error", (error) => {
      // 检查是否是 AbortError
      if (error instanceof Error && error.name === 'AbortError') {
        // AbortError 是正常的，不需要显示错误
        return;
      }
      console.error('WaveSurfer error:', error);
      setAudioError('Audio loading failed, please check network connection or audio file validity');
      setWaveformLoading(false);
    });

    wavesurfer.current.on("audioprocess", () => {
      // 检查是否已被取消
      if (abortControllerRef.current?.signal.aborted) return;
      
      const t = wavesurfer.current!.getCurrentTime();
      setCurrentTime(t);
      if (onTimeUpdate) {
        onTimeUpdate(t * 1000);
      }
    });

    wavesurfer.current.on("interaction", () => { 
      // 检查是否已被取消
      if (abortControllerRef.current?.signal.aborted) return;
      
      const t = wavesurfer.current!.getCurrentTime();
      setCurrentTime(t);
      if (onTimeUpdate) {
        onTimeUpdate(t * 1000);
      }
    });

    wavesurfer.current.on("play", () => {
      // 检查是否已被取消
      if (abortControllerRef.current?.signal.aborted) return;
      setPlaying(true);
    });
    
    wavesurfer.current.on("pause", () => {
      // 检查是否已被取消
      if (abortControllerRef.current?.signal.aborted) return;
      setPlaying(false);
    });

    // 保持音量和倍速同步
    wavesurfer.current.setVolume(volume);
    wavesurfer.current.setPlaybackRate(playbackRate);

    return () => {
      // 取消请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // 安全地销毁 WaveSurfer 实例
      if (wavesurfer.current) {
        try {
          wavesurfer.current.destroy();
        } catch (error) {
          // 忽略销毁时的 AbortError
          if (!(error instanceof Error && error.name === 'AbortError')) {
            console.error('WaveSurfer destroy error:', error);
          }
        }
        wavesurfer.current = null;
      }
    };
    // eslint-disable-next-line
  }, [audioSrc]);

  // 音量和倍速变化时同步到 wavesurfer
  useEffect(() => {
    if (wavesurfer.current && !abortControllerRef.current?.signal.aborted) {
      wavesurfer.current.setVolume(volume);
    }
  }, [volume]);
  useEffect(() => {
    if (wavesurfer.current && !abortControllerRef.current?.signal.aborted) {
      wavesurfer.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (wavesurfer.current && !abortControllerRef.current?.signal.aborted) {
        wavesurfer.current.pause();
        setPlaying(false);
      }
    },
  }));

  // 关闭所有弹层
  const closeAllPoppers = () => {
    setSpeedAnchorEl(null);
    setVolumeAnchorEl(null);
  };

  // Esc 关闭 & 滚动时收起
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAllPoppers();
    };
    const onScroll = () => closeAllPoppers();

    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // 控制
  const togglePlay = () => {
    if (wavesurfer.current && !abortControllerRef.current?.signal.aborted) {
      wavesurfer.current.playPause();
    }
  };

  const handleSliderChange = (_: any, value: number) => {
    if (wavesurfer.current && !abortControllerRef.current?.signal.aborted) {
      wavesurfer.current.seekTo(value / duration);
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (_: any, value: number) => {
    setVolume(value);
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    setSpeedAnchorEl(null);
  };

  const handleForward = () => {
    if (wavesurfer.current && !abortControllerRef.current?.signal.aborted) {
      const t = Math.min(currentTime + 10, duration);
      wavesurfer.current.seekTo(t / duration);
      setCurrentTime(t);
    }
  };
  const handleReplay = () => {
    if (wavesurfer.current && !abortControllerRef.current?.signal.aborted) {
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
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              // 更轻的遮罩 + 不拦点击（保证“可以先播放”）
              bgcolor: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(1px)",
              pointerEvents: "none",
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              {/* 三点波浪动画 */}
              <Box sx={{ position: "relative", width: 28, height: 10 }}>
                <Box sx={{
                  position: "absolute", top: 0, left: 0, width: 6, height: 6, borderRadius: "50%",
                  bgcolor: "text.secondary", opacity: .7, animation: `${waveBounce} 1.1s ease-in-out infinite`, animationDelay: "0s",
                }} />
                <Box sx={{
                  position: "absolute", top: 0, left: 11, width: 6, height: 6, borderRadius: "50%",
                  bgcolor: "text.secondary", opacity: .7, animation: `${waveBounce} 1.1s ease-in-out infinite`, animationDelay: ".15s",
                }} />
                <Box sx={{
                  position: "absolute", top: 0, left: 22, width: 6, height: 6, borderRadius: "50%",
                  bgcolor: "text.secondary", opacity: .7, animation: `${waveBounce} 1.1s ease-in-out infinite`, animationDelay: ".3s",
                }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ userSelect: "none" }}>
                Loading waveform… but it’s okay to start play
              </Typography>
            </Stack>
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
                Retry
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

        {/* 倍速（Popper + ClickAwayListener） */}
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="text"
            size="small"
            onClick={(e) => {
              // 互斥：打开速度时关音量
              setVolumeAnchorEl(null);
              setSpeedAnchorEl(speedAnchorEl ? null : (e.currentTarget as HTMLElement));
            }}
            sx={{
              minWidth: 30,
              px: 1,
              color: "text.secondary",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            {playbackRate}x
          </Button>

          <Popper
            open={Boolean(speedAnchorEl)}
            anchorEl={speedAnchorEl}
            placement="top"
            sx={{ zIndex: 1400 }}
          >
            <ClickAwayListener onClickAway={() => setSpeedAnchorEl(null)}>
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  borderRadius: 1,
                  boxShadow: 3,
                  p: 0.5,              
                  mb: 1,
                  minWidth: 80,            
                  maxWidth: 90,
                }}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <Button
                    key={speed}
                    fullWidth
                    size="small"
                    onClick={() => handleSpeedChange(speed)}
                    sx={{
                      justifyContent: "flex-start",
                      color: speed === playbackRate ? "primary.main" : "text.primary",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    {speed}x
                  </Button>
                ))}
              </Box>
            </ClickAwayListener>
          </Popper>
        </Box>

        {/* 音量（Popper + ClickAwayListener） */}
        <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={(e) => {
              // 互斥：打开音量时关速度
              setSpeedAnchorEl(null);
              setVolumeAnchorEl(volumeAnchorEl ? null : (e.currentTarget as HTMLElement));
            }}
            sx={{ color: "#485D92" }}
          >
            {volume > 0 ? <VolumeUp /> : <VolumeOff />}
          </IconButton>

          <Popper
            open={Boolean(volumeAnchorEl)}
            anchorEl={volumeAnchorEl}
            placement="top"
            sx={{ zIndex: 1400 }}
          >
            <ClickAwayListener onClickAway={() => setVolumeAnchorEl(null)}>
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  borderRadius: 1,
                  boxShadow: 3,
                  pt: 2,
                  pb: 1,
                  mb: 2,
                  minWidth: 30,
                }}
              >
                <Slider
                  value={volume}
                  onChange={handleVolumeChange}
                  onChangeCommitted={() => setVolumeAnchorEl(null)} // 松手即收起（可选）
                  min={0}
                  max={1}
                  step={0.01}
                  orientation="vertical"
                  sx={{
                    height: 100,
                    '& .MuiSlider-thumb': { width: 12, height: 12 },
                    '& .MuiSlider-track': { width: 4 },
                    '& .MuiSlider-rail': { width: 4 },
                  }}
                />
              </Box>
            </ClickAwayListener>
          </Popper>
        </Box>
      </Stack>
    </Box>
  );
});

export default AudioPlayerComponent;
