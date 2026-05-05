import { useRef, useCallback, useState, useEffect } from "react";
import { getAudioEngine, type BGMTrack, type SFXSound } from "./audioEngine";

export function useAudio() {
  const engineRef = useRef(getAudioEngine());
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(() => engineRef.current.getVolume());

  // Sync mute state from engine (e.g. if set externally)
  useEffect(() => {
    setIsMuted(engineRef.current.isMuted());
    setVolumeState(engineRef.current.getVolume());
  }, []);

  const playBGM = useCallback((track: BGMTrack) => {
    engineRef.current.playBGM(track);
  }, []);

  const playSFX = useCallback((sound: SFXSound) => {
    engineRef.current.playSFX(sound);
  }, []);

  const setVolume = useCallback((vol: number) => {
    engineRef.current.setVolume(vol);
    setVolumeState(vol);
  }, []);

  const mute = useCallback((muted: boolean) => {
    engineRef.current.mute(muted);
    setIsMuted(muted);
  }, []);

  const toggleMute = useCallback(() => {
    const current = engineRef.current.isMuted();
    engineRef.current.mute(!current);
    setIsMuted(!current);
  }, []);

  return {
    playBGM,
    playSFX,
    setVolume,
    mute,
    toggleMute,
    isMuted,
    volume,
  };
}
