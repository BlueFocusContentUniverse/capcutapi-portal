# Video Editor Component

## Overview

The Video Editor is a timeline-based editor that displays video tracks, segments, and materials from CapCut draft data.

## Structure

```
app/(main)/editor/page.tsx          - Main editor page route
components/video-editor.tsx          - Main editor container
components/timeline-track.tsx        - Individual track component
components/timeline-segment.tsx      - Individual segment component
lib/editor-utils.ts                  - Utility functions
```

## Features

### Current Features
- ✅ Display multiple tracks with different types (video, audio, text, effect)
- ✅ Color-coded tracks based on type
- ✅ Segments positioned by time on timeline
- ✅ Material lookup and binding (segment.material_id → materials)
- ✅ Zoom in/out functionality
- ✅ Scrollable timeline
- ✅ Time ruler with second markers
- ✅ Hover effects and tooltips

### Track Types & Colors
- **Video**: Blue (bg-blue-600)
- **Audio**: Green (bg-green-600)
- **Effect**: Purple (bg-purple-600)
- **Text**: Orange (bg-orange-600)
- **Sticker**: Pink (bg-pink-600)

## Data Structure

### Track Object
```typescript
{
  id: string;           // Unique track ID
  name: string;         // Track name (displayed in left panel)
  type: string;         // Track type (video, audio, text, effect, etc.)
  segments: Segment[];  // Array of segments
}
```

### Segment Object
```typescript
{
  id: string;
  material_id: string;  // References material in content.materials
  target_timerange: {
    start: number;      // Start time in microseconds
    duration: number;   // Duration in microseconds
  }
}
```

### Materials Object
```typescript
{
  videos: Material[];
  audios: Material[];
  texts: Material[];
  effects: Material[];
  // ... other material types
}
```

## How to Extend

### 1. Add Custom Track Actions

In `timeline-track.tsx`, add buttons to the track label area:

```tsx
<div className="flex items-center gap-2 w-full">
  <div className={`w-3 h-3 rounded ${trackColor}`} />
  <div className="flex-1">{track.name}</div>
  {/* Add custom buttons here */}
  <button onClick={() => handleMuteTrack(track.id)}>
    Mute
  </button>
</div>
```

### 2. Add Segment Interactions

In `timeline-segment.tsx`, add click handlers:

```tsx
const handleSegmentClick = () => {
  // Handle segment selection
};

const handleSegmentDrag = () => {
  // Handle segment dragging
};

<div
  onClick={handleSegmentClick}
  onMouseDown={handleSegmentDrag}
  // ...
>
```

### 3. Add Playback Control

Create a new component `playback-controls.tsx`:

```tsx
export function PlaybackControls({ duration, currentTime, onSeek }) {
  return (
    <div className="flex items-center gap-4">
      <button onClick={onPlay}>Play</button>
      <button onClick={onPause}>Pause</button>
      <input 
        type="range" 
        min={0} 
        max={duration}
        value={currentTime}
        onChange={(e) => onSeek(Number(e.target.value))}
      />
    </div>
  );
}
```

Then add it to `video-editor.tsx`:

```tsx
const [currentTime, setCurrentTime] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);

<PlaybackControls 
  duration={duration}
  currentTime={currentTime}
  onSeek={setCurrentTime}
/>
```

### 4. Add Preview Panel

Create `video-preview.tsx`:

```tsx
export function VideoPreview({ tracks, materials, currentTime }) {
  // Render preview based on current time
  return (
    <div className="aspect-video bg-black">
      {/* Canvas or video preview */}
    </div>
  );
}
```

### 5. Add Context Menu

Use a context menu library or create custom:

```tsx
const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault();
  // Show context menu with options:
  // - Delete segment
  // - Duplicate segment
  // - Split segment
  // - Change properties
};
```

### 6. Add Segment Editing

Create a sidebar or modal for editing segment properties:

```tsx
export function SegmentEditor({ segment, material, onUpdate }) {
  return (
    <div className="p-4">
      <h3>Edit Segment</h3>
      <input 
        type="number"
        label="Start Time"
        value={segment.target_timerange.start / 1000000}
        onChange={(e) => {
          onUpdate({
            ...segment,
            target_timerange: {
              ...segment.target_timerange,
              start: Number(e.target.value) * 1000000
            }
          });
        }}
      />
      {/* Add more property editors */}
    </div>
  );
}
```

### 7. Add Export Functionality

```tsx
const handleExport = async () => {
  const exportData = {
    content: {
      tracks,
      materials,
      duration,
      // ... other properties
    },
    draft_id: draftId,
  };
  
  // Send to API
  const response = await fetch('/api/drafts/export', {
    method: 'POST',
    body: JSON.stringify(exportData),
  });
};
```

## API Integration

### Fetch Draft Data

Replace the placeholder in `app/(main)/editor/page.tsx`:

```tsx
// Current (placeholder):
const response = await fetch('/draftcontent.json');

// Replace with:
const response = await fetch(`/api/drafts/${draftId}/data`);
```

### Create API Route

Create `app/api/drafts/[draftId]/export/route.ts`:

```tsx
export async function POST(request: Request) {
  const data = await request.json();
  
  // Process and save draft
  // Return export result
  
  return Response.json({ success: true });
}
```

## Styling

The editor uses Tailwind CSS classes. Common patterns:

- Dark theme: `bg-gray-900`, `bg-gray-800`, `text-white`
- Borders: `border-gray-700`
- Hover states: `hover:bg-gray-700`
- Colors: Track type colors (blue, green, orange, etc.)

## Performance Tips

1. **Virtualization**: For many tracks/segments, implement virtual scrolling
2. **Memoization**: Use `useMemo` for expensive calculations
3. **Debouncing**: Debounce zoom and scroll events
4. **Canvas Rendering**: For complex timelines, consider using Canvas API

## Future Enhancements

- [ ] Drag and drop segments
- [ ] Resize segments
- [ ] Multi-select segments
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts
- [ ] Video preview
- [ ] Audio waveform visualization
- [ ] Transition effects between segments
- [ ] Keyframe editing
- [ ] Layers and masking
- [ ] Real-time collaboration

## Troubleshooting

### Segments not displaying
- Check if `target_timerange.start` and `duration` are valid numbers
- Verify material_id exists in materials object
- Check console for errors

### Timeline not scrolling
- Ensure ScrollArea component is properly imported
- Check if timeline width is calculated correctly

### Colors not showing
- Verify Tailwind classes are not being purged
- Check if track.type matches color mapping keys

