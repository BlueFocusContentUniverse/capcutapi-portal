import React from "react";
import { useVerticalResize } from "../../../../hooks/use-vertical-resize";
import { TIMELINE_CONSTANTS } from "../../../advanced-timeline/constants";
import { Overlay } from "../../../../types";

interface UseTimelineResizeOptions {
  overlays: Overlay[];
}

/**
 * Custom hook for managing timeline resize functionality
 * Calculates dynamic max height based on track count and manages resize state
 */
export const useTimelineResize = ({ overlays }: UseTimelineResizeOptions) => {
  /**
   * Calculate the number of tracks based on overlays
   * Tracks are determined by the row property of overlays
   */
  const trackCount = React.useMemo(() => {
    if (overlays.length === 0) return 1; // Minimum 1 track
    const maxRow = Math.max(...overlays.map((overlay) => overlay.row || 0));
    return maxRow + 1; // Rows are 0-indexed
  }, [overlays]);

  /**
   * Calculate dynamic max height based on track count
   * Formula: Timeline Header (40px) + (Track Count × Track Height) + Padding (67px)
   */
  const dynamicMaxHeight = React.useMemo(() => {
    return (
      TIMELINE_CONSTANTS.MARKERS_HEIGHT +
      trackCount * TIMELINE_CONSTANTS.TRACK_HEIGHT +
      67
    ); // Additional padding for comfortable viewing AND to account for scrollbar height
  }, [trackCount]);

  /**
   * Vertical resize functionality for timeline with dynamic max height
   */
  const { bottomHeight, isResizing, handleMouseDown } = useVerticalResize({
    initialHeight: 300,
    minHeight: 200,
    maxHeight: dynamicMaxHeight,
    storageKey: "editor-timeline-height",
  });

  return {
    bottomHeight,
    isResizing,
    handleMouseDown,
    trackCount,
    dynamicMaxHeight,
  };
};
