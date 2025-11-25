import React from "react";
import Timeline from "../../advanced-timeline/timeline";
import { TimelineTrack } from "../../advanced-timeline/types";

import { useEditorContext } from "../../../contexts/editor-context";
import { useEditorSidebar } from "../../../contexts/sidebar-context";

import { useTimelineTransforms } from "./hooks/use-timeline-transforms";
import { useTimelineHandlers } from "./hooks/use-timeline-handlers";
import { useTimelineResize } from "./hooks/use-timeline-resize";
import { TimelineResizeHandle } from "./components";
import {
  Overlay,
  TextOverlay,
  CaptionOverlay,
  OverlayType,
} from "../../../types";
import { FPS } from "../../../../constants";

interface TimelineSectionProps {
  className?: string;
}

/**
 * TimelineSection Component
 *
 * Encapsulates all timeline-related logic including:
 * - Data transformation between overlays and timeline tracks
 * - Event handlers for timeline interactions
 * - State management for timeline synchronization
 */
export const TimelineSection: React.FC<TimelineSectionProps> = () => {
  /** State for timeline tracks derived from overlays */
  const [timelineTracks, setTimelineTracks] = React.useState<TimelineTrack[]>(
    [],
  );

  /** Ref to track last processed overlays to prevent unnecessary re-renders */
  const lastProcessedOverlaysRef = React.useRef<Overlay[]>([]);

  /** State for timeline collapse */
  const [isTimelineCollapsed, setIsTimelineCollapsed] = React.useState(false);

  /** Get editor context values */
  const {
    overlays,
    currentFrame,
    isPlaying,
    playerRef,
    togglePlayPause,
    durationInFrames,
    setSelectedOverlayId,
    selectedOverlayIds,
    setSelectedOverlayIds,
    deleteOverlay,
    duplicateOverlay,
    splitOverlay,
    handleOverlayChange,
    setOverlays,
    // Add playback controls
    playbackRate,
    setPlaybackRate,
    // Add aspect ratio controls
    aspectRatio,
    setAspectRatio,
  } = useEditorContext();

  // Get sidebar context for setting active panel
  const { setActivePanel, setIsOpen } = useEditorSidebar();

  // Get transformation functions
  const { transformOverlaysToTracks } = useTimelineTransforms();

  // Get timeline handlers
  const {
    isUpdatingFromTimelineRef,
    handleTracksChange,
    handleTimelineFrameChange,
    handleItemSelect,
    handleSelectedItemsChange,
    handleDeleteItems,
    handleDuplicateItems,
    handleSplitItems,
    handleItemMove,
    handleItemResize,
    handleNewItemDrop,
  } = useTimelineHandlers({
    overlays,
    playerRef,
    setSelectedOverlayId,
    setSelectedOverlayIds,
    deleteOverlay,
    duplicateOverlay,
    splitOverlay,
    handleOverlayChange,
    setOverlays,
    setActivePanel,
    setIsOpen,
  });

  // Update timeline tracks when overlays change (but not during timeline updates)
  React.useEffect(() => {
    const isUpdating = isUpdatingFromTimelineRef.current;

    if (!isUpdating) {
      // Only update if overlays have actually changed (deep comparison of key properties)
      const hasChanged =
        overlays.length !== lastProcessedOverlaysRef.current.length ||
        overlays.some((overlay, index) => {
          const lastOverlay = lastProcessedOverlaysRef.current[index];
          if (!lastOverlay) {
            return true;
          }

          // Check basic properties
          if (
            overlay.id !== lastOverlay.id ||
            overlay.from !== lastOverlay.from ||
            overlay.durationInFrames !== lastOverlay.durationInFrames ||
            overlay.row !== lastOverlay.row ||
            overlay.type !== lastOverlay.type ||
            overlay.width !== lastOverlay.width ||
            overlay.height !== lastOverlay.height ||
            overlay.left !== lastOverlay.left ||
            overlay.top !== lastOverlay.top ||
            overlay.isDragging !== lastOverlay.isDragging
          ) {
            return true;
          }

          // Check text overlay specific properties
          if (overlay.type === OverlayType.TEXT) {
            const textOverlay = overlay as TextOverlay;
            const lastTextOverlay = lastOverlay as TextOverlay;
            if (
              textOverlay.content !== lastTextOverlay.content ||
              JSON.stringify(textOverlay.styles || {}) !==
                JSON.stringify(lastTextOverlay.styles || {})
            ) {
              return true;
            }
          }

          // Check caption overlay specific properties
          if (overlay.type === OverlayType.CAPTION) {
            const captionOverlay = overlay as CaptionOverlay;
            const lastCaptionOverlay = lastOverlay as CaptionOverlay;
            if (
              JSON.stringify(captionOverlay.styles || {}) !==
                JSON.stringify(lastCaptionOverlay.styles || {}) ||
              JSON.stringify(captionOverlay.captions || []) !==
                JSON.stringify(lastCaptionOverlay.captions || [])
            ) {
              return true;
            }
          }

          // Check sound overlay specific properties (including fade effects)
          if (overlay.type === OverlayType.SOUND) {
            const soundOverlay = overlay as any; // SoundOverlay type
            const lastSoundOverlay = lastOverlay as any;
            if (
              JSON.stringify(soundOverlay.styles || {}) !==
              JSON.stringify(lastSoundOverlay.styles || {})
            ) {
              return true;
            }
          }

          // Check video overlay specific properties (for video replacement)
          if (overlay.type === OverlayType.VIDEO) {
            const videoOverlay = overlay as any;
            const lastVideoOverlay = lastOverlay as any;
            // Check if video source or content changed (important for video replacement)
            if (
              videoOverlay.src !== lastVideoOverlay.src ||
              videoOverlay.content !== lastVideoOverlay.content ||
              videoOverlay.videoStartTime !== lastVideoOverlay.videoStartTime ||
              videoOverlay.mediaSrcDuration !==
                lastVideoOverlay.mediaSrcDuration
            ) {
              return true;
            }
          }

          // Check image overlay specific properties (for image replacement)
          if (overlay.type === OverlayType.IMAGE) {
            const imageOverlay = overlay as any;
            const lastImageOverlay = lastOverlay as any;
            // Check if image source changed (important for image replacement)
            if (imageOverlay.src !== lastImageOverlay.src) {
              return true;
            }
          }

          // Check video/image/sticker overlay styles (for padding, filters, etc.)
          if ("styles" in overlay && "styles" in lastOverlay) {
            if (
              JSON.stringify((overlay as any).styles || {}) !==
              JSON.stringify((lastOverlay as any).styles || {})
            ) {
              return true;
            }
          }

          return false;
        });

      if (hasChanged) {
        lastProcessedOverlaysRef.current = [...overlays];
        setTimelineTracks(transformOverlaysToTracks(overlays));
      }
    }
  }, [overlays, transformOverlaysToTracks, isUpdatingFromTimelineRef]);

  // Playback control handlers
  const handlePlay = React.useCallback(() => {
    if (!isPlaying) {
      togglePlayPause();
    }
  }, [isPlaying, togglePlayPause]);

  const handlePause = React.useCallback(() => {
    if (isPlaying) {
      togglePlayPause();
    }
  }, [isPlaying, togglePlayPause]);

  const handleSeekToStart = React.useCallback(() => {
    if (playerRef?.current) {
      playerRef.current.seekTo(0);
    }
  }, [playerRef]);

  const handleSeekToEnd = React.useCallback(() => {
    if (playerRef?.current) {
      const endFrame = Math.max(0, durationInFrames - 1);
      playerRef.current.seekTo(endFrame);
    }
  }, [playerRef, durationInFrames]);

  // Timeline resize functionality
  const { bottomHeight, isResizing, handleMouseDown } = useTimelineResize({
    overlays,
  });

  // Collapse handler
  const handleCollapseChange = React.useCallback((collapsed: boolean) => {
    setIsTimelineCollapsed(collapsed);
  }, []);

  // Calculate effective height based on collapse state
  const HEADER_HEIGHT = 57; // Height of timeline header
  const effectiveHeight = isTimelineCollapsed ? HEADER_HEIGHT : bottomHeight;

  return (
    <>
      <TimelineResizeHandle
        onMouseDown={handleMouseDown}
        isResizing={isResizing}
      />

      {/* Timeline Section with controlled height */}
      <div
        style={{
          height: `${effectiveHeight}px`,
        }}
        className="flex flex-col overflow-hidden"
      >
        <Timeline
          tracks={timelineTracks}
          totalDuration={durationInFrames / FPS} // Convert frames to seconds
          currentFrame={currentFrame}
          fps={FPS}
          onFrameChange={handleTimelineFrameChange}
          onItemMove={handleItemMove}
          onItemResize={handleItemResize}
          onItemSelect={handleItemSelect}
          onSelectedItemsChange={handleSelectedItemsChange}
          onDeleteItems={handleDeleteItems}
          onDuplicateItems={handleDuplicateItems}
          onSplitItems={handleSplitItems}
          selectedItemIds={selectedOverlayIds
            .filter((id): id is number => typeof id === "number" && !isNaN(id))
            .map((id: number) => id.toString())}
          onTracksChange={handleTracksChange}
          onNewItemDrop={handleNewItemDrop}
          showZoomControls={true}
          showTimelineGuidelines={true}
          enableTrackDrag={true}
          enableMagneticTrack={true}
          enableTrackDelete={true}
          showPlaybackControls={true}
          isPlaying={isPlaying}
          hideItemsOnDrag={true}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeekToStart={handleSeekToStart}
          onSeekToEnd={handleSeekToEnd}
          playbackRate={playbackRate}
          setPlaybackRate={setPlaybackRate}
          showUndoRedoControls={true}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          showAspectRatioControls={true}
          onCollapseChange={handleCollapseChange}
          overlays={overlays}
        />
      </div>
    </>
  );
};
