import { AspectRatio, Overlay } from "../types";

/**
 * Transform overlay positions when aspect ratio changes
 * This ensures overlays remain visible and proportionally positioned
 * when switching between different aspect ratios (e.g., 16:9 to 9:16)
 */

export interface CanvasDimensions {
  width: number;
  height: number;
}

/**
 * Custom dimensions configuration for aspect ratios
 * Use this when loading external projects with non-standard dimensions
 */
export type CustomDimensionsMap = Partial<
  Record<AspectRatio, CanvasDimensions>
>;

/**
 * Default dimensions for each aspect ratio
 */
const DEFAULT_DIMENSIONS: Record<AspectRatio, CanvasDimensions> = {
  "9:16": { width: 1080, height: 1920 },
  "4:5": { width: 1080, height: 1350 },
  "1:1": { width: 1080, height: 1080 },
  "16:9": { width: 1920, height: 1080 },
};

/**
 * Get canvas dimensions for a specific aspect ratio
 * @param aspectRatio - The aspect ratio to get dimensions for
 * @param customDimensions - Optional custom dimensions map from external project
 * @returns Canvas dimensions for the given aspect ratio
 */
export function getDimensionsForAspectRatio(
  aspectRatio: AspectRatio,
  customDimensions?: CustomDimensionsMap,
): CanvasDimensions {
  // Use custom dimensions if provided for this aspect ratio
  if (customDimensions?.[aspectRatio]) {
    return customDimensions[aspectRatio];
  }

  // Fall back to default dimensions
  return DEFAULT_DIMENSIONS[aspectRatio] || DEFAULT_DIMENSIONS["16:9"];
}

/**
 * Transforms a single overlay's position and dimensions based on canvas size change
 * @param overlay - The overlay to transform
 * @param oldDimensions - Previous canvas dimensions
 * @param newDimensions - New canvas dimensions
 * @returns Updated overlay with transformed position and size
 */
export function transformOverlayForAspectRatio(
  overlay: Overlay,
  oldDimensions: CanvasDimensions,
  newDimensions: CanvasDimensions,
): Overlay {
  // Calculate scale factors for both dimensions
  const scaleX = newDimensions.width / oldDimensions.width;
  const scaleY = newDimensions.height / oldDimensions.height;

  // Transform position
  const newLeft = overlay.left * scaleX;
  const newTop = overlay.top * scaleY;

  // Transform dimensions
  const newWidth = overlay.width * scaleX;
  const newHeight = overlay.height * scaleY;

  return {
    ...overlay,
    left: Math.round(newLeft),
    top: Math.round(newTop),
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}

/**
 * Transforms all overlays for a new aspect ratio
 * @param overlays - Array of overlays to transform
 * @param oldDimensions - Previous canvas dimensions
 * @param newDimensions - New canvas dimensions
 * @returns Array of transformed overlays
 */
export function transformOverlaysForAspectRatio(
  overlays: Overlay[],
  oldDimensions: CanvasDimensions,
  newDimensions: CanvasDimensions,
): Overlay[] {
  // If dimensions haven't changed, return overlays as-is
  if (
    oldDimensions.width === newDimensions.width &&
    oldDimensions.height === newDimensions.height
  ) {
    return overlays;
  }

  return overlays.map((overlay) =>
    transformOverlayForAspectRatio(overlay, oldDimensions, newDimensions),
  );
}

/**
 * Check if overlays need transformation (i.e., if dimensions changed significantly)
 * @param oldDimensions - Previous canvas dimensions
 * @param newDimensions - New canvas dimensions
 * @returns true if transformation is needed
 */
export function shouldTransformOverlays(
  oldDimensions: CanvasDimensions,
  newDimensions: CanvasDimensions,
): boolean {
  // Use a small tolerance to avoid unnecessary transformations due to rounding
  const tolerance = 0.01;

  const widthRatio =
    Math.abs(oldDimensions.width - newDimensions.width) / oldDimensions.width;
  const heightRatio =
    Math.abs(oldDimensions.height - newDimensions.height) /
    oldDimensions.height;

  return widthRatio > tolerance || heightRatio > tolerance;
}
