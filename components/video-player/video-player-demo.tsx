"use client";

import { useState } from "react";

import { Tabs } from "@/components/ui/tabs";

import { CustomVideoPlayer, VideoPlayer } from "./index";

/**
 * Demo component showcasing both video player variants
 * This is for demonstration purposes - remove or move as needed
 */
export function VideoPlayerDemo() {
  const [currentTime, setCurrentTime] = useState(0);

  // Example video sources (replace with your own)
  const videoSrc =
    "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4";
  const posterSrc =
    "https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.jpg";

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Video Player Components</h1>
        <p className="text-muted-foreground">
          Built with Vidstack and styled with Tailwind CSS
        </p>
      </div>

      <div className="space-y-6">
        {/* Default Layout Player */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Default Layout</h2>
            <p className="text-sm text-muted-foreground">
              Pre-built production-ready player with Vidstack's default theme
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <VideoPlayer
              src={videoSrc}
              poster={posterSrc}
              title="Demo Video - Default Layout"
              aspectRatio="16/9"
              onPlay={() => console.log("Default player: Playing")}
              onPause={() => console.log("Default player: Paused")}
              onEnd={() => console.log("Default player: Ended")}
              onTimeUpdate={setCurrentTime}
            />
          </div>
        </div>

        {/* Custom Layout Player */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Custom Layout</h2>
            <p className="text-sm text-muted-foreground">
              Custom controls built from scratch with Tailwind CSS
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <CustomVideoPlayer
              src={videoSrc}
              poster={posterSrc}
              title="Demo Video - Custom Layout"
              aspectRatio="16/9"
            />
          </div>
        </div>

        {/* Current Time Display */}
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm">
            <strong>Current Time:</strong> {currentTime.toFixed(2)}s
          </p>
        </div>

        {/* Multiple Sources Example */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Multiple Sources</h2>
            <p className="text-sm text-muted-foreground">
              Player automatically selects the best format for the browser
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <VideoPlayer
              src={[
                {
                  src: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/low.mp4",
                  type: "video/mp4",
                },
                {
                  src: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/high.mp4",
                  type: "video/mp4",
                },
              ]}
              poster={posterSrc}
              title="Multiple Sources Demo"
              aspectRatio="16/9"
            />
          </div>
        </div>

        {/* Different Aspect Ratios */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Different Aspect Ratios</h2>
            <p className="text-sm text-muted-foreground">
              Videos can be displayed in various aspect ratios
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium">4:3 (Classic)</p>
              <VideoPlayer
                src={videoSrc}
                poster={posterSrc}
                title="4:3 Aspect Ratio"
                aspectRatio="4/3"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">21:9 (Ultrawide)</p>
              <VideoPlayer
                src={videoSrc}
                poster={posterSrc}
                title="21:9 Aspect Ratio"
                aspectRatio="21/9"
              />
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Usage Examples</h2>
          <div className="rounded-lg border bg-muted p-4">
            <pre className="overflow-x-auto text-sm">
              <code>{`import { VideoPlayer } from '@/components/video-player';

function MyComponent() {
  return (
    <VideoPlayer
      src="https://example.com/video.mp4"
      poster="https://example.com/poster.jpg"
      title="My Video"
      aspectRatio="16/9"
      onPlay={() => console.log('Playing')}
      onPause={() => console.log('Paused')}
      onEnd={() => console.log('Ended')}
    />
  );
}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
