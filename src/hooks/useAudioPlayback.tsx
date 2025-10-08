import { useEffect, useState } from "react";

/**
 * 监听 audio 元素播放时间变化，返回当前播放时间（以毫秒为单位）
 * @param {React.RefObject<HTMLAudioElement>} audioRef - 指向 AudioPlayer 组件的 ref
 * @returns {number} currentTime 当前播放时间（ms）
 */
export function useAudioPlayback(audioRef) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime * 1000);

    audio.addEventListener("timeupdate", updateTime);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, [audioRef]);

  return currentTime;
}

  // // Monitor audio playback time for text highlighting
  // useEffect(function setupAudioTimeListener() {
  //   const audio = audioRef.current;
  //   if (!audio) return;

  //   function updateTime() {
  //     setCurrentTime(audio.currentTime * 1000);
  //   }
  //   audio.addEventListener("timeupdate", updateTime);
  //   return function cleanup() {
  //     audio.removeEventListener("timeupdate", updateTime);
  //   };
  // }, []);

  // useEffect(() => {}, [currentTime]);
  // function handleTimeUpdate(time) {
  //   setCurrentTime(time);
  // }
