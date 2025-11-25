import { useState, useCallback, useEffect, useRef } from "react";

interface UseVerticalResizeOptions {
  /** Initial height of the bottom panel (timeline) in pixels */
  initialHeight?: number;
  /** Minimum height of the bottom panel */
  minHeight?: number;
  /** Maximum height of the bottom panel (can be dynamic if passed as function result) */
  maxHeight?: number;
  /** Local storage key to persist the height */
  storageKey?: string;
}

interface UseVerticalResizeReturn {
  /** Current height of the bottom panel */
  bottomHeight: number;
  /** Whether the user is currently dragging the resize handle */
  isResizing: boolean;
  /** Handler for mouse down on the resize handle */
  handleMouseDown: (e: React.MouseEvent) => void;
  /** Reset the height to initial value */
  resetHeight: () => void;
}

/**
 * Custom hook for handling vertical resize between two panels
 * Allows users to drag a divider to adjust the height of bottom panel
 */
export const useVerticalResize = (
  options: UseVerticalResizeOptions = {},
): UseVerticalResizeReturn => {
  const {
    initialHeight = 300,
    minHeight = 200,
    maxHeight = 800,
    storageKey = "editor-timeline-height",
  } = options;

  // Try to load saved height from localStorage
  const getSavedHeight = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const height = parseInt(saved, 10);
          if (!isNaN(height) && height >= minHeight && height <= maxHeight) {
            return height;
          }
        }
      } catch (e) {
        console.warn("Failed to load saved height from localStorage:", e);
      }
    }
    return initialHeight;
  }, [initialHeight, minHeight, maxHeight, storageKey]);

  const [bottomHeight, setBottomHeight] = useState(getSavedHeight);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  // Save height to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, bottomHeight.toString());
      } catch (e) {
        console.warn("Failed to save height to localStorage:", e);
      }
    }
  }, [bottomHeight, storageKey]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      // Calculate the new height based on mouse movement
      // Since we're dragging up/down, we need to invert the delta
      const deltaY = startYRef.current - e.clientY;
      const newHeight = startHeightRef.current + deltaY;

      // Clamp the height between min and max
      // maxHeight is evaluated at call time, so it can be dynamic
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      setBottomHeight(clampedHeight);
    },
    [isResizing, minHeight, maxHeight],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startYRef.current = e.clientY;
      startHeightRef.current = bottomHeight;
    },
    [bottomHeight],
  );

  const resetHeight = useCallback(() => {
    setBottomHeight(initialHeight);
  }, [initialHeight]);

  // Add and remove mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Prevent text selection while dragging
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ns-resize";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Clamp the height if maxHeight changes and current height exceeds it
  useEffect(() => {
    if (bottomHeight > maxHeight) {
      setBottomHeight(maxHeight);
    }
  }, [maxHeight, bottomHeight]);

  return {
    bottomHeight,
    isResizing,
    handleMouseDown,
    resetHeight,
  };
};
