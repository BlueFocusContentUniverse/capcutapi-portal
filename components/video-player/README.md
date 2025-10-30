# Video Player Components

This directory contains video player components built with [Vidstack](https://vidstack.io) - a modern, accessible, and highly customizable video player library.

## Components

### 1. VideoPlayer (Default Layout)

The `VideoPlayer` component uses Vidstack's default pre-built layout. It's production-ready and includes all common video controls out of the box.

**Features:**
- Pre-styled with Vidstack's default theme
- Includes play/pause, volume, fullscreen, captions, and more
- Fully accessible
- Responsive design
- Keyboard shortcuts
- Touch/gesture support

**Usage:**

```tsx
import { VideoPlayer } from '@/components/video-player';

function MyComponent() {
  return (
    <VideoPlayer
      src="https://example.com/video.mp4"
      poster="https://example.com/poster.jpg"
      title="My Video"
      aspectRatio="16/9"
    />
  );
}
```

### 2. CustomVideoPlayer (Tailwind CSS Layout)

The `CustomVideoPlayer` component is built from scratch using Tailwind CSS. It demonstrates how to create custom controls and layouts.

**Features:**
- Custom controls styled with Tailwind CSS
- Uses Lucide React icons
- Fully customizable
- Shows/hides controls on hover
- Gradient overlay effect

**Usage:**

```tsx
import { CustomVideoPlayer } from '@/components/video-player';

function MyComponent() {
  return (
    <CustomVideoPlayer
      src="https://example.com/video.mp4"
      poster="https://example.com/poster.jpg"
      title="My Custom Video"
      aspectRatio="16/9"
    />
  );
}
```

## Props

### VideoPlayerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string \| { src: string; type: string }[]` | required | Video source URL or array of sources |
| `poster` | `string` | optional | Poster image URL to display before video loads |
| `title` | `string` | `'Video'` | Video title for accessibility |
| `playsinline` | `boolean` | `true` | Whether to play inline on mobile |
| `autoplay` | `boolean` | `false` | Whether to autoplay |
| `loop` | `boolean` | `false` | Whether to loop the video |
| `muted` | `boolean` | `false` | Whether to mute the video |
| `className` | `string` | `''` | Custom class name for styling |
| `aspectRatio` | `string` | `'16/9'` | Aspect ratio (e.g., '16/9', '4/3') |
| `onEnd` | `() => void` | optional | Callback when video ends |
| `onPlay` | `() => void` | optional | Callback when video starts playing |
| `onPause` | `() => void` | optional | Callback when video pauses |
| `onTimeUpdate` | `(time: number) => void` | optional | Callback with current time update |

## Multiple Video Sources

You can provide multiple sources for better browser compatibility:

```tsx
<VideoPlayer
  src={[
    { src: 'https://example.com/video.mp4', type: 'video/mp4' },
    { src: 'https://example.com/video.webm', type: 'video/webm' },
  ]}
  poster="https://example.com/poster.jpg"
  title="Multi-source Video"
/>
```

## HLS and DASH Streaming

Vidstack automatically handles HLS and DASH streaming:

```tsx
// HLS Example
<VideoPlayer
  src="https://example.com/video.m3u8"
  title="HLS Stream"
/>

// DASH Example
<VideoPlayer
  src="https://example.com/video.mpd"
  title="DASH Stream"
/>
```

## Event Handlers

```tsx
<VideoPlayer
  src="https://example.com/video.mp4"
  onPlay={() => console.log('Video started playing')}
  onPause={() => console.log('Video paused')}
  onEnd={() => console.log('Video ended')}
  onTimeUpdate={(time) => console.log('Current time:', time)}
/>
```

## Styling

### Default Layout

The default layout can be customized using CSS variables. Add to your global CSS:

```css
:root {
  --media-brand: #fa6d6d;
  --media-focus-ring: #fa6d6d;
}
```

### Custom Layout

The custom layout uses Tailwind CSS classes and can be modified directly in the component file.

## Accessibility

Both components are fully accessible and include:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management

## Performance

- Lazy loading by default
- Automatic quality selection for adaptive streaming
- Efficient memory management
- Hardware acceleration support

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Resources

- [Vidstack Documentation](https://vidstack.io)
- [Vidstack React Guide](https://vidstack.io/docs/player/getting-started/installation/react)
- [Media Icons Catalog](https://vidstack.io/media-icons)

