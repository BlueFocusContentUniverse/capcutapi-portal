"use client";

import "@vidstack/react/player/styles/base.css";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  CaptionButton,
  FullscreenButton,
  MuteButton,
  PIPButton,
  PlayButton,
  Time,
  TimeSlider,
  VolumeSlider,
} from "@vidstack/react";
import {
  Maximize,
  Minimize,
  Pause,
  PictureInPicture,
  Play,
  Subtitles,
  Volume2,
  VolumeX,
} from "lucide-react";

export interface CustomVideoPlayerProps {
  src: string | { src: string; type: string }[];
  poster?: string;
  title?: string;
  playsinline?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  aspectRatio?: string;
}

/**
 * Custom video player with Tailwind CSS styling
 * Build your own controls and layout from scratch
 */
export function CustomVideoPlayer({
  src,
  poster,
  title = "Video",
  playsinline = true,
  autoplay = false,
  loop = false,
  muted = false,
  className = "",
  aspectRatio = "16/9",
}: CustomVideoPlayerProps) {
  return (
    <MediaPlayer
      className={`relative w-full overflow-hidden rounded-lg bg-black shadow-lg ${className}`}
      title={title}
      src={src}
      poster={poster}
      playsinline={playsinline}
      autoplay={autoplay}
      loop={loop}
      muted={muted}
      aspectRatio={aspectRatio}
      crossorigin=""
    >
      <MediaProvider className="absolute inset-0" />

      {/* Controls Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100">
        {/* Bottom Controls Bar */}
        <div className="flex flex-col gap-2 p-4">
          {/* Progress Bar */}
          <TimeSlider.Root className="group relative flex h-2 w-full cursor-pointer items-center">
            {/* Track */}
            <TimeSlider.Track className="relative h-1 w-full overflow-hidden rounded-full bg-white/30">
              {/* Progress */}
              <TimeSlider.TrackFill className="absolute left-0 top-0 h-full w-[var(--slider-fill)] rounded-full bg-primary transition-all" />
              {/* Preview */}
              <TimeSlider.Progress className="absolute left-0 top-0 h-full w-[var(--slider-progress)] rounded-full bg-white/50" />
            </TimeSlider.Track>
            {/* Thumb */}
            <TimeSlider.Thumb className="absolute left-[var(--slider-fill)] h-3 w-3 -translate-x-1/2 rounded-full bg-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100" />
          </TimeSlider.Root>

          {/* Control Buttons */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              {/* Play/Pause Button */}
              <PlayButton className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20">
                <Play className="media-paused:block hidden h-5 w-5 fill-current" />
                <Pause className="media-playing:block hidden h-5 w-5" />
              </PlayButton>

              {/* Volume Controls */}
              <MuteButton className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20">
                <Volume2 className="media-volume-normal:block hidden h-5 w-5" />
                <VolumeX className="media-muted:block hidden h-5 w-5" />
              </MuteButton>

              <VolumeSlider.Root className="group relative flex h-10 w-20 cursor-pointer items-center">
                <VolumeSlider.Track className="relative h-1 w-full overflow-hidden rounded-full bg-white/30">
                  <VolumeSlider.TrackFill className="absolute left-0 top-0 h-full w-[var(--slider-fill)] rounded-full bg-white transition-all" />
                </VolumeSlider.Track>
                <VolumeSlider.Thumb className="absolute left-[var(--slider-fill)] h-3 w-3 -translate-x-1/2 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100" />
              </VolumeSlider.Root>

              {/* Time Display */}
              <div className="flex items-center gap-1 text-sm font-medium text-white">
                <Time className="time" type="current" />
                <span>/</span>
                <Time className="time" type="duration" />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Caption Button */}
              <CaptionButton className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20">
                <Subtitles className="h-5 w-5" />
              </CaptionButton>

              {/* Picture-in-Picture Button */}
              <PIPButton className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20">
                <PictureInPicture className="h-5 w-5" />
              </PIPButton>

              {/* Fullscreen Button */}
              <FullscreenButton className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20">
                <Maximize className="media-not-fullscreen:block hidden h-5 w-5" />
                <Minimize className="media-fullscreen:block hidden h-5 w-5" />
              </FullscreenButton>
            </div>
          </div>
        </div>
      </div>
    </MediaPlayer>
  );
}
