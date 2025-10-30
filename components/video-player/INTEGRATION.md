# Video Player Integration Guide

Complete guide for integrating Vidstack video players into your Next.js application.

## 📦 Installation

The required packages are already installed in this project:

```json
{
  "@vidstack/react": "^1.12.13",
  "lucide-react": "^0.548.0"
}
```

## 🎯 Quick Start

### 1. Import the Component

```tsx
import { VideoPlayer } from '@/components/video-player';
```

### 2. Use in Your Page

```tsx
export default function MyPage() {
  return (
    <div className="container mx-auto py-8">
      <VideoPlayer
        src="https://example.com/video.mp4"
        poster="https://example.com/poster.jpg"
        title="My Video"
        aspectRatio="16/9"
      />
    </div>
  );
}
```

## 🎨 Available Components

### VideoPlayer (Recommended)

Pre-built player with Vidstack's default theme - production ready.

```tsx
import { VideoPlayer } from '@/components/video-player';

<VideoPlayer
  src="https://example.com/video.mp4"
  poster="https://example.com/poster.jpg"
  title="My Video"
  aspectRatio="16/9"
  onPlay={() => console.log('Playing')}
/>
```

### CustomVideoPlayer

Fully customizable player styled with Tailwind CSS.

```tsx
import { CustomVideoPlayer } from '@/components/video-player';

<CustomVideoPlayer
  src="https://example.com/video.mp4"
  poster="https://example.com/poster.jpg"
  title="My Custom Player"
/>
```

## 📚 Common Use Cases

### Video from API

```tsx
'use client';

import { useEffect, useState } from 'react';
import { VideoPlayer } from '@/components/video-player';

export function VideoFromAPI() {
  const [videoData, setVideoData] = useState(null);

  useEffect(() => {
    fetch('/api/video/123')
      .then(res => res.json())
      .then(data => setVideoData(data));
  }, []);

  if (!videoData) return <div>Loading...</div>;

  return (
    <VideoPlayer
      src={videoData.url}
      poster={videoData.thumbnail}
      title={videoData.title}
    />
  );
}
```

### Video Gallery

```tsx
'use client';

import { VideoPlayer } from '@/components/video-player';

const videos = [
  { id: 1, url: '...', poster: '...', title: 'Video 1' },
  { id: 2, url: '...', poster: '...', title: 'Video 2' },
  { id: 3, url: '...', poster: '...', title: 'Video 3' },
];

export function VideoGallery() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <div key={video.id} className="space-y-2">
          <VideoPlayer
            src={video.url}
            poster={video.poster}
            title={video.title}
            aspectRatio="16/9"
          />
          <h3 className="font-semibold">{video.title}</h3>
        </div>
      ))}
    </div>
  );
}
```

### Video with Progress Tracking

```tsx
'use client';

import { useState } from 'react';
import { VideoPlayer } from '@/components/video-player';

export function VideoWithProgress() {
  const [progress, setProgress] = useState(0);

  const handleTimeUpdate = (currentTime: number) => {
    // Calculate progress percentage
    const duration = 180; // Get from video metadata
    const percent = (currentTime / duration) * 100;
    setProgress(percent);
  };

  return (
    <div className="space-y-4">
      <VideoPlayer
        src="https://example.com/video.mp4"
        title="Tracked Video"
        onTimeUpdate={handleTimeUpdate}
      />
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm">Progress: {progress.toFixed(1)}%</p>
      </div>
    </div>
  );
}
```

### HLS/DASH Streaming

```tsx
import { VideoPlayer } from '@/components/video-player';

// HLS Example
export function HLSVideo() {
  return (
    <VideoPlayer
      src="https://example.com/video/master.m3u8"
      poster="https://example.com/poster.jpg"
      title="HLS Stream"
    />
  );
}

// DASH Example
export function DASHVideo() {
  return (
    <VideoPlayer
      src="https://example.com/video/manifest.mpd"
      poster="https://example.com/poster.jpg"
      title="DASH Stream"
    />
  );
}
```

### Video Modal/Dialog

```tsx
'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { VideoPlayer } from '@/components/video-player';
import { Button } from '@/components/ui/button';

export function VideoModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Watch Video
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="p-4">
          <VideoPlayer
            src="https://example.com/video.mp4"
            poster="https://example.com/poster.jpg"
            title="Modal Video"
          />
        </div>
      </Dialog>
    </>
  );
}
```

### Autoplay on Scroll (Viewport)

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { VideoPlayer } from '@/components/video-player';

export function AutoplayOnScroll() {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      <VideoPlayer
        src="https://example.com/video.mp4"
        autoplay={isInView}
        muted
        loop
      />
    </div>
  );
}
```

## 🔧 Configuration

### Global Styling

The video player theme colors are configured in `app/globals.css`:

```css
media-player {
  --media-brand: var(--primary);
  --media-focus-ring: var(--primary);
}
```

### Custom Styling

You can override styles using className:

```tsx
<VideoPlayer
  src="..."
  className="rounded-xl shadow-2xl"
/>
```

## 🎬 Supported Video Formats

### Direct Playback
- MP4 (H.264, H.265)
- WebM (VP8, VP9)
- OGV (Theora)

### Streaming Protocols
- HLS (.m3u8) - with hls.js
- DASH (.mpd) - with dash.js

### YouTube & Vimeo
For external platforms, check the [Vidstack provider documentation](https://vidstack.io/docs/player/providers).

## ⚡ Performance Tips

1. **Use poster images** - Improves perceived load time
2. **Lazy load videos** - Load videos only when needed
3. **Optimize video files** - Use appropriate codecs and bitrates
4. **Use adaptive streaming** - HLS/DASH for better quality control
5. **Preload strategy** - Set appropriate preload attribute

```tsx
// Good for hero videos
<VideoPlayer src="..." poster="..." />

// Better for galleries
<VideoPlayer 
  src="..." 
  poster="..."
  // Add preload control via media player options
/>
```

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ iOS Safari
- ✅ Chrome Mobile

## 🔍 Debugging

### Enable Console Logs

```tsx
<VideoPlayer
  src="..."
  onPlay={() => console.log('Playing')}
  onPause={() => console.log('Paused')}
  onError={(error) => console.error('Error:', error)}
  onTimeUpdate={(time) => console.log('Time:', time)}
/>
```

### Check Network Tab

Look for video loading in your browser's Network tab to verify:
- Video is loading correctly
- Correct MIME types
- CORS headers (if loading from different domain)

## 📖 Additional Resources

- [Vidstack Documentation](https://vidstack.io)
- [Vidstack React Guide](https://vidstack.io/docs/player/getting-started/installation/react)
- [Media Icons](https://vidstack.io/media-icons)
- [API Reference](https://vidstack.io/docs/player/api/player)

## 🤝 Support

For issues or questions:
1. Check the [Vidstack Discord](https://discord.gg/vidstack)
2. Review [GitHub Discussions](https://github.com/vidstack/player/discussions)
3. See [component README](./README.md) for more examples

