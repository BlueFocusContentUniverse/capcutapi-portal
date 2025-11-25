# Video Editor Components

This folder contains all components related to the video editor feature.

## Structure

- **index.tsx** - Main VideoEditor component that orchestrates the entire editor
- **materials-panel.tsx** - Materials panel that displays all materials in the draft
- **timeline-track.tsx** - Individual track component in the timeline
- **timeline-segment.tsx** - Individual segment component within a track

## Components

### VideoEditor (index.tsx)

Main component that provides:

- Timeline view with zoom controls
- Track visualization
- Materials panel toggle
- Time ruler and markers

**Props:**

- `tracks` - Array of track objects
- `materials` - Object containing all materials (videos, audios, texts, etc.)
- `duration` - Total duration in microseconds

### MaterialsPanel

Side panel that displays all materials in the draft:

- Categorized by type (videos, audios, texts, stickers, effects)
- Tabbed interface for easy navigation
- Expandable material details
- Material count summaries

**Props:**

- `materials` - Object containing all materials

### TimelineTrack

Displays a single track in the timeline:

- Track label with type indicator
- Segments visualization
- Responsive to timeline width and zoom

**Props:**

- `track` - Track object
- `materialMap` - Map of material IDs to material data
- `timelineWidth` - Width of the timeline in pixels
- `pixelsPerSecond` - Zoom-adjusted pixels per second
- `trackColor` - Color for track type indicator
- `isEven` - Boolean for alternating row colors

### TimelineSegment

Displays a single segment within a track:

- Visual representation with appropriate color
- Material name display
- Hover effects and resize handles
- Tooltip with detailed information

**Props:**

- `segment` - Segment object
- `material` - Associated material data
- `startPixels` - Start position in pixels
- `durationPixels` - Duration in pixels
- `trackType` - Type of track
- `trackColor` - Color for the track

## Features

### Materials Panel

- View all materials organized by type
- Quick navigation between different material categories
- Detailed view of material properties
- Material count statistics

### Timeline Features

- Zoom in/out controls (20% to 500%)
- Time markers every second
- Color-coded tracks by type:
  - Video: Blue
  - Audio: Green
  - Effect: Purple
  - Text: Orange
  - Sticker: Pink
- Segment hover effects
- Material name display on segments
- Sticky track labels and time ruler

## Usage

```tsx
import { VideoEditor } from "@/components/video-editor";

<VideoEditor
  tracks={draftData.content.tracks}
  materials={draftData.content.materials}
  duration={draftData.content.duration}
/>;
```

## Backward Compatibility

The main `components/video-editor.tsx` file re-exports the VideoEditor component for backward compatibility. Similarly, `timeline-track.tsx` and `timeline-segment.tsx` in the components root re-export from this folder.
