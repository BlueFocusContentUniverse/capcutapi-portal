"use client";

import { CustomVideoPlayer, VideoPlayer } from "./index";

/**
 * Simple examples showing different ways to use the video players
 */

// Example 1: Basic Usage
export function BasicVideoPlayerExample() {
  return (
    <div className="max-w-4xl">
      <VideoPlayer
        src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"
        poster="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.jpg"
        title="Basic Video Example"
      />
    </div>
  );
}

// Example 2: With Event Handlers
export function VideoPlayerWithEventsExample() {
  return (
    <div className="max-w-4xl">
      <VideoPlayer
        src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"
        poster="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.jpg"
        title="Video with Events"
        onPlay={() => console.log("Video started playing")}
        onPause={() => console.log("Video paused")}
        onEnd={() => console.log("Video ended")}
        onTimeUpdate={(time) => console.log("Current time:", time)}
      />
    </div>
  );
}

// Example 3: Multiple Sources
export function MultipleSourcesExample() {
  return (
    <div className="max-w-4xl">
      <VideoPlayer
        src={[
          {
            src: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4",
            type: "video/mp4",
          },
          {
            src: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/medium.mp4",
            type: "video/mp4",
          },
        ]}
        poster="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.jpg"
        title="Multiple Sources"
      />
    </div>
  );
}

// Example 4: Custom Layout
export function CustomLayoutExample() {
  return (
    <div className="max-w-4xl">
      <CustomVideoPlayer
        src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"
        poster="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.jpg"
        title="Custom Styled Player"
      />
    </div>
  );
}

// Example 5: Different Aspect Ratios
export function AspectRatioExamples() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-medium">16:9 (Standard)</h3>
        <VideoPlayer
          src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"
          aspectRatio="16/9"
          title="16:9 Video"
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">4:3 (Classic)</h3>
        <VideoPlayer
          src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"
          aspectRatio="4/3"
          title="4:3 Video"
        />
      </div>
    </div>
  );
}

// Example 6: Autoplay and Loop
export function AutoplayLoopExample() {
  return (
    <div className="max-w-4xl">
      <VideoPlayer
        src="https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4"
        title="Autoplay & Loop"
        autoplay
        loop
        muted // Note: Autoplay typically requires muted
      />
    </div>
  );
}

// Example 7: HLS Streaming
export function HLSStreamExample() {
  return (
    <div className="max-w-4xl">
      <VideoPlayer
        src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        poster="https://image.mux.com/x36xhzz/thumbnail.jpg"
        title="HLS Stream"
      />
    </div>
  );
}

// Example 8: Responsive Grid
export function ResponsiveGridExample() {
  const videos = [
    {
      id: 1,
      src: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4",
      poster:
        "https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.jpg",
      title: "Video 1",
    },
    {
      id: 2,
      src: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4",
      poster:
        "https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.jpg",
      title: "Video 2",
    },
    {
      id: 3,
      src: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4",
      poster:
        "https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.jpg",
      title: "Video 3",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <div key={video.id}>
          <VideoPlayer
            src={video.src}
            poster={video.poster}
            title={video.title}
            aspectRatio="16/9"
          />
        </div>
      ))}
    </div>
  );
}
