"use client";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import {
  MediaPlayer,
  MediaProvider,
  MediaProviderInstance,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { useRef } from "react";

export interface VideoPlayerProps {
  /**
   * Video source URL or array of sources
   */
  src: string | { src: string; type: string }[];
  /**
   * Poster image URL to display before video loads
   */
  poster?: string;
  /**
   * Video title for accessibility
   */
  title?: string;
  /**
   * Whether to play inline on mobile (default: true)
   */
  playsinline?: boolean;
  /**
   * Whether to autoplay (default: false)
   */
  autoplay?: boolean;
  /**
   * Whether to loop the video (default: false)
   */
  loop?: boolean;
  /**
   * Whether to mute the video (default: false)
   */
  muted?: boolean;
  /**
   * Custom class name for styling
   */
  className?: string;
  /**
   * Aspect ratio (e.g., '16/9', '4/3')
   */
  aspectRatio?: string;
  /**
   * Callback when video ends
   */
  onEnd?: () => void;
  /**
   * Callback when video starts playing
   */
  onPlay?: () => void;
  /**
   * Callback when video pauses
   */
  onPause?: () => void;
  /**
   * Callback with current time update
   */
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({
  src,
  poster,
  title = "Video",
  playsinline = true,
  autoplay = false,
  loop = false,
  muted = false,
  className = "",
  aspectRatio = "16/9",
  onEnd,
  onPlay,
  onPause,
  onTimeUpdate,
}: VideoPlayerProps) {
  const player = useRef<MediaProviderInstance>(null);

  return (
    <MediaPlayer
      className={`w-full ${className}`}
      title={title}
      src={src}
      poster={poster}
      playsInline={playsinline}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      aspectRatio={aspectRatio}
      crossOrigin=""
      onEnd={onEnd}
      onPlay={onPlay}
      onPause={onPause}
      onTimeUpdate={(event) => {
        if (onTimeUpdate) {
          onTimeUpdate(event.currentTime);
        }
      }}
    >
      <MediaProvider ref={player} />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
