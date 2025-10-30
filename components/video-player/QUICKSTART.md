# Video Player Quick Start 🚀

Get a video player running in 30 seconds!

## 1️⃣ Import

```tsx
import { VideoPlayer } from '@/components/video-player';
```

## 2️⃣ Use

```tsx
export default function MyPage() {
  return (
    <VideoPlayer
      src="https://example.com/video.mp4"
      poster="https://example.com/poster.jpg"
      title="My Video"
    />
  );
}
```

## 3️⃣ Done! ✅

That's it! You now have a fully functional video player with:
- ✅ Play/Pause controls
- ✅ Volume control
- ✅ Fullscreen
- ✅ Progress bar
- ✅ Keyboard shortcuts
- ✅ Mobile support
- ✅ Accessibility

---

## Common Props

```tsx
<VideoPlayer
  src="video.mp4"              // Required: Video URL
  poster="poster.jpg"          // Optional: Thumbnail image
  title="Video Title"          // Optional: For accessibility
  aspectRatio="16/9"           // Optional: Default is 16/9
  autoplay={false}             // Optional: Default is false
  loop={false}                 // Optional: Default is false
  muted={false}                // Optional: Default is false
  playsinline={true}           // Optional: Play inline on mobile
  onPlay={() => {}}            // Optional: Called when video plays
  onPause={() => {}}           // Optional: Called when video pauses
  onEnd={() => {}}             // Optional: Called when video ends
  onTimeUpdate={(time) => {}}  // Optional: Called during playback
/>
```

---

## Multiple Video Sources

```tsx
<VideoPlayer
  src={[
    { src: 'video.mp4', type: 'video/mp4' },
    { src: 'video.webm', type: 'video/webm' },
  ]}
  poster="poster.jpg"
  title="My Video"
/>
```

---

## HLS Streaming

```tsx
<VideoPlayer
  src="https://example.com/stream.m3u8"
  poster="poster.jpg"
  title="Live Stream"
/>
```

---

## Need More?

- 📖 Full documentation: See `README.md`
- 🔧 Integration guide: See `INTEGRATION.md`
- 💡 Examples: See `examples.tsx`
- 🎨 Custom styling: Use `CustomVideoPlayer` component

---

## Custom Styled Player

Want full control over styling?

```tsx
import { CustomVideoPlayer } from '@/components/video-player';

<CustomVideoPlayer
  src="video.mp4"
  poster="poster.jpg"
  title="Custom Player"
/>
```

---

## Pro Tips 💡

1. **Always provide a poster** - Better UX while loading
2. **Set appropriate aspect ratio** - Prevents layout shift
3. **Use autoplay with muted** - Browsers block unmuted autoplay
4. **Add event handlers** - Track user engagement
5. **Test on mobile** - Different behavior than desktop

---

## Troubleshooting

**Video not playing?**
- Check video URL is accessible
- Verify CORS headers (if different domain)
- Check browser console for errors

**Controls not showing?**
- Make sure you imported styles (should be automatic)
- Check `app/globals.css` includes Vidstack imports

**Need help?**
- Check `INTEGRATION.md` debugging section
- Review examples in `examples.tsx`

---

Made with ❤️ using [Vidstack](https://vidstack.io)

