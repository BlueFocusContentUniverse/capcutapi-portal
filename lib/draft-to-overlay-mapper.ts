/**
 * Data mapper to convert CapCut draft data format to React Video Editor Overlay format
 */

import {
  AspectRatio,
  ClipOverlay,
  ImageOverlay,
  Overlay,
  OverlayType,
  SoundOverlay,
  StickerOverlay,
  TextOverlay,
} from "@/reactvideoeditor/pro/types";

// CapCut Draft Types
export interface DraftTrack {
  id: string;
  name: string;
  type: string;
  segments: DraftSegment[];
  attribute: number;
  flag: number;
  is_default_name: boolean;
}

export interface DraftSegment {
  id: string;
  material_id: string;
  target_timerange: {
    start: number; // microseconds
    duration: number; // microseconds
  };
  source_timerange?: {
    start: number;
    duration: number;
  };
  render_index?: number;
  track_render_index?: number;
  visible?: boolean;
  volume?: number; // Volume level (0-1)
  speed?: number; // Playback speed
  clip?: {
    scale?: { x: number; y: number };
    transform?: { x: number; y: number };
    rotation?: number;
  };
  [key: string]: any;
}

export interface DraftMaterial {
  id: string;
  name?: string;
  material_name?: string;
  duration?: number; // microseconds
  remote_url?: string;
  path?: string;
  text?: string;
  content?: string;
  width?: number;
  height?: number;
  volume?: number;
  [key: string]: any;
}

export interface DraftMaterials {
  videos?: DraftMaterial[];
  audios?: DraftMaterial[];
  texts?: DraftMaterial[];
  stickers?: DraftMaterial[];
  effects?: DraftMaterial[];
  video_effects?: DraftMaterial[];
  images?: DraftMaterial[];
  [key: string]: DraftMaterial[] | undefined;
}

export interface DraftContent {
  duration: number; // microseconds
  canvas_config: {
    width: number;
    height: number;
    ratio: string;
  };
  name: string;
  tracks: DraftTrack[];
  materials: DraftMaterials;
}

// Default canvas dimensions
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;
const DEFAULT_FPS = 30;

/**
 * Convert microseconds to frames
 */
function microsecondsToFrames(
  microseconds: number,
  fps: number = DEFAULT_FPS,
): number {
  return Math.round((microseconds / 1_000_000) * fps);
}

/**
 * Convert microseconds to seconds
 */
function microsecondsToSeconds(microseconds: number): number {
  return microseconds / 1_000_000;
}

/**
 * Calculate aspect ratio from width and height dimensions
 */
export function calculateAspectRatioFromDimensions(
  width: number,
  height: number,
): AspectRatio {
  const ratio = width / height;

  // Check for exact common ratios with some tolerance
  const tolerance = 0.01;

  // 16:9 = 1.777...
  if (Math.abs(ratio - 16 / 9) < tolerance) return "16:9";

  // 9:16 = 0.5625
  if (Math.abs(ratio - 9 / 16) < tolerance) return "9:16";

  // 1:1 = 1.0
  if (Math.abs(ratio - 1) < tolerance) return "1:1";

  // 4:5 = 0.8
  if (Math.abs(ratio - 4 / 5) < tolerance) return "4:5";

  // For non-standard ratios, find the closest match
  if (ratio > 1.5) return "16:9"; // Wide landscape
  if (ratio < 0.7) return "9:16"; // Tall portrait
  if (ratio < 0.9) return "4:5"; // Slightly portrait
  if (ratio >= 0.9 && ratio <= 1.1) return "1:1"; // Square-ish

  return "16:9"; // Default to landscape
}

/**
 * Parse aspect ratio string to AspectRatio type
 */
export function parseAspectRatio(ratio: string): AspectRatio {
  // Normalize the ratio string
  const normalized = ratio.toLowerCase().replace(/\s/g, "");

  switch (normalized) {
    case "16:9":
    case "16/9":
    case "1.78":
    case "1.7778":
      return "16:9";
    case "9:16":
    case "9/16":
    case "0.56":
    case "0.5625":
      return "9:16";
    case "1:1":
    case "1/1":
    case "1":
    case "1.0":
      return "1:1";
    case "4:5":
    case "4/5":
    case "0.8":
      return "4:5";
    default: {
      // Try to parse numeric ratio and determine closest match
      const numericRatio = parseFloat(normalized);
      if (!isNaN(numericRatio)) {
        if (numericRatio > 1.5) return "16:9";
        if (numericRatio < 0.7) return "9:16";
        if (numericRatio < 0.85) return "4:5";
        return "1:1";
      }
      return "16:9"; // Default
    }
  }
}

/**
 * Get dimensions from aspect ratio
 */
export function getAspectRatioDimensions(ratio: AspectRatio): {
  width: number;
  height: number;
} {
  switch (ratio) {
    case "16:9":
      return { width: 1280, height: 720 };
    case "9:16":
      return { width: 720, height: 1280 };
    case "1:1":
      return { width: 1080, height: 1080 };
    case "4:5":
      return { width: 1080, height: 1350 };
    default:
      return { width: 1280, height: 720 };
  }
}

/**
 * Build material lookup map for quick access
 */
function buildMaterialMap(
  materials: DraftMaterials,
): Map<string, { data: DraftMaterial; type: string }> {
  const map = new Map<string, { data: DraftMaterial; type: string }>();

  if (!materials) return map;

  Object.entries(materials).forEach(([type, items]) => {
    if (Array.isArray(items)) {
      items.forEach((item) => {
        if (item.id) {
          map.set(item.id, { data: item, type });
        }
      });
    }
  });

  return map;
}

/**
 * Parse text content from CapCut text material
 * CapCut stores text content as JSON in the 'content' field
 */
function parseTextContent(material: DraftMaterial): {
  text: string;
  styles: Record<string, any>;
} {
  let text = material.text || "";
  let styles: Record<string, any> = {};

  if (material.content) {
    try {
      const parsed = JSON.parse(material.content);
      if (parsed.text) {
        text = parsed.text;
      }
      if (parsed.styles) {
        styles = parsed.styles;
      }
      // Handle nested text structures
      if (parsed.texts && Array.isArray(parsed.texts)) {
        text = parsed.texts
          .map((t: any) => t.text || t.content || "")
          .join("\n");
      }
    } catch {
      // If parsing fails, use the content as-is
      text = material.content;
    }
  }

  return { text, styles };
}

/**
 * Create a TextOverlay from CapCut text material and segment
 */
function createTextOverlay(
  segment: DraftSegment,
  material: DraftMaterial,
  row: number,
  canvasWidth: number,
  canvasHeight: number,
  overlayId: number,
  fps: number,
): TextOverlay {
  const { text, styles: parsedStyles } = parseTextContent(material);

  // Transform coordinates from CapCut:
  // X: 0 = center, -1 = left edge, 1 = right edge (unit: half canvas width)
  // Y: 0 = center, -1 = top edge, 1 = bottom edge (unit: half canvas height)
  // Default Y = 0.8 puts text near bottom (subtitle position)
  const transformX = segment.clip?.transform?.x ?? 0;
  const transformY = segment.clip?.transform?.y ?? 0.8; // Default to subtitle position (near bottom)

  // Calculate center position on canvas from normalized transform
  const centerX = (canvasWidth / 2) * (1 + transformX);
  const centerY = (canvasHeight / 2) * (1 + transformY);

  // Text dimensions (80% width, auto height based on content)
  const width = canvasWidth * 0.8;
  const height = canvasHeight * 0.15; // Estimate for text height

  // Calculate top-left position from center point
  const left = Math.max(0, centerX - width / 2);
  const top = Math.max(0, centerY - height / 2);

  return {
    id: overlayId,
    type: OverlayType.TEXT,
    content: text,
    from: microsecondsToFrames(segment.target_timerange.start, fps),
    durationInFrames: microsecondsToFrames(
      segment.target_timerange.duration,
      fps,
    ),
    row,
    left,
    top,
    width,
    height,
    rotation: segment.clip?.rotation ?? 0,
    isDragging: false,
    styles: {
      fontSize: parsedStyles.fontSize || "2rem",
      fontWeight: parsedStyles.fontWeight || "400",
      color: parsedStyles.color || "#FFFFFF",
      backgroundColor: parsedStyles.backgroundColor || "",
      fontFamily: parsedStyles.fontFamily || "font-inter",
      fontStyle: parsedStyles.fontStyle || "normal",
      textDecoration: parsedStyles.textDecoration || "none",
      lineHeight: parsedStyles.lineHeight || "1.2",
      textAlign: parsedStyles.textAlign || "center",
      letterSpacing: parsedStyles.letterSpacing || "0",
      textShadow: parsedStyles.textShadow || "",
      opacity: 1,
      zIndex: 1,
      transform: "none",
      animation: {
        enter: "fade",
        exit: "fade",
      },
    },
  };
}

/**
 * Create a ClipOverlay (video) from CapCut video material and segment
 */
function createVideoOverlay(
  segment: DraftSegment,
  material: DraftMaterial,
  row: number,
  canvasWidth: number,
  canvasHeight: number,
  overlayId: number,
  fps: number,
): ClipOverlay {
  const videoUrl = material.remote_url || material.path || "";
  const thumbnailUrl = material.remote_url || "";

  // Calculate video start time from source timerange
  const videoStartTime = segment.source_timerange
    ? microsecondsToSeconds(segment.source_timerange.start)
    : 0;

  // Calculate media source duration in seconds
  const mediaSrcDuration = material.duration
    ? microsecondsToSeconds(material.duration)
    : undefined;

  // Get volume from segment (priority) or material (fallback)
  const volume = segment.volume ?? material.volume ?? 1;

  // Get speed from segment
  const speed = segment.speed ?? 1;

  return {
    id: overlayId,
    type: OverlayType.VIDEO,
    content: thumbnailUrl,
    src: videoUrl,
    from: microsecondsToFrames(segment.target_timerange.start, fps),
    durationInFrames: microsecondsToFrames(
      segment.target_timerange.duration,
      fps,
    ),
    row,
    left: 0,
    top: 0,
    width: canvasWidth,
    height: canvasHeight,
    rotation: segment.clip?.rotation ?? 0,
    isDragging: false,
    videoStartTime,
    mediaSrcDuration,
    speed,
    styles: {
      opacity: 1,
      zIndex: 100,
      transform: "none",
      objectFit: "cover",
      volume,
      animation: {
        enter: "none",
        exit: "fade",
      },
    },
  };
}

/**
 * Create a SoundOverlay from CapCut audio material and segment
 */
function createSoundOverlay(
  segment: DraftSegment,
  material: DraftMaterial,
  row: number,
  overlayId: number,
  fps: number,
): SoundOverlay {
  const audioUrl = material.remote_url || material.path || "";
  const displayName = material.name || material.material_name || "Audio";

  // Calculate audio start time from source timerange
  const startFromSound = segment.source_timerange
    ? microsecondsToSeconds(segment.source_timerange.start)
    : 0;

  // Calculate media source duration in seconds
  const mediaSrcDuration = material.duration
    ? microsecondsToSeconds(material.duration)
    : undefined;

  // Get volume from segment (priority) or material (fallback)
  const volume = segment.volume ?? material.volume ?? 1;

  return {
    id: overlayId,
    type: OverlayType.SOUND,
    content: displayName,
    src: audioUrl,
    from: microsecondsToFrames(segment.target_timerange.start, fps),
    durationInFrames: microsecondsToFrames(
      segment.target_timerange.duration,
      fps,
    ),
    row,
    left: 0,
    top: 0,
    width: 1920,
    height: 100,
    rotation: 0,
    isDragging: false,
    startFromSound,
    mediaSrcDuration,
    styles: {
      opacity: 1,
      volume,
    },
  };
}

/**
 * Create an ImageOverlay from CapCut image/sticker material and segment
 */
function createImageOverlay(
  segment: DraftSegment,
  material: DraftMaterial,
  row: number,
  canvasWidth: number,
  canvasHeight: number,
  overlayId: number,
  fps: number,
): ImageOverlay {
  const imageUrl = material.remote_url || material.path || "";

  // Transform coordinates from CapCut:
  // X: 0 = center, -1 = left edge, 1 = right edge (unit: half canvas width)
  // Y: 0 = center, -1 = top edge, 1 = bottom edge (unit: half canvas height)
  const scale = segment.clip?.scale || { x: 1, y: 1 };
  const transformX = segment.clip?.transform?.x ?? 0;
  const transformY = segment.clip?.transform?.y ?? 0;

  // Calculate center position on canvas from normalized transform
  const centerX = (canvasWidth / 2) * (1 + transformX);
  const centerY = (canvasHeight / 2) * (1 + transformY);

  // Calculate size based on material dimensions and scale
  const materialWidth = material.width || canvasWidth * 0.5;
  const materialHeight = material.height || canvasHeight * 0.5;

  const width = materialWidth * scale.x;
  const height = materialHeight * scale.y;

  // Calculate top-left position from center point
  const left = centerX - width / 2;
  const top = centerY - height / 2;

  return {
    id: overlayId,
    type: OverlayType.IMAGE,
    src: imageUrl,
    content: imageUrl,
    from: microsecondsToFrames(segment.target_timerange.start, fps),
    durationInFrames: microsecondsToFrames(
      segment.target_timerange.duration,
      fps,
    ),
    row,
    left: Math.max(0, left),
    top: Math.max(0, top),
    width,
    height,
    rotation: segment.clip?.rotation ?? 0,
    isDragging: false,
    styles: {
      opacity: 1,
      objectFit: "contain",
    },
  };
}

/**
 * Create a StickerOverlay from CapCut sticker material and segment
 */
function createStickerOverlay(
  segment: DraftSegment,
  material: DraftMaterial,
  row: number,
  canvasWidth: number,
  canvasHeight: number,
  overlayId: number,
  fps: number,
): StickerOverlay {
  const stickerContent = material.path || material.remote_url || "";

  // Transform coordinates from CapCut:
  // X: 0 = center, -1 = left edge, 1 = right edge (unit: half canvas width)
  // Y: 0 = center, -1 = top edge, 1 = bottom edge (unit: half canvas height)
  const scale = segment.clip?.scale || { x: 1, y: 1 };
  const transformX = segment.clip?.transform?.x ?? 0;
  const transformY = segment.clip?.transform?.y ?? 0;

  // Calculate center position on canvas from normalized transform
  const centerX = (canvasWidth / 2) * (1 + transformX);
  const centerY = (canvasHeight / 2) * (1 + transformY);

  const width = 200 * scale.x;
  const height = 200 * scale.y;

  // Calculate top-left position from center point
  const left = centerX - width / 2;
  const top = centerY - height / 2;

  return {
    id: overlayId,
    type: OverlayType.STICKER,
    content: stickerContent,
    category: "Default",
    from: microsecondsToFrames(segment.target_timerange.start, fps),
    durationInFrames: microsecondsToFrames(
      segment.target_timerange.duration,
      fps,
    ),
    row,
    left: Math.max(0, left),
    top: Math.max(0, top),
    width,
    height,
    rotation: segment.clip?.rotation ?? 0,
    isDragging: false,
    styles: {
      opacity: 1,
    },
  };
}

/**
 * Map CapCut track type to material type
 */
export interface MapperOptions {
  fps?: number;
  canvasWidth?: number;
  canvasHeight?: number;
}

/**
 * Main function to convert CapCut draft data to React Video Editor overlays
 */
export function mapDraftToOverlays(
  draftContent: DraftContent,
  options: MapperOptions = {},
): {
  overlays: Overlay[];
  aspectRatio: AspectRatio;
  durationInFrames: number;
  width: number;
  height: number;
} {
  const fps = options.fps ?? DEFAULT_FPS;
  const canvasWidth =
    options.canvasWidth ?? draftContent.canvas_config?.width ?? DEFAULT_WIDTH;
  const canvasHeight =
    options.canvasHeight ??
    draftContent.canvas_config?.height ??
    DEFAULT_HEIGHT;

  // Parse aspect ratio
  const aspectRatio = parseAspectRatio(
    draftContent.canvas_config?.ratio ?? "16:9",
  );

  // Build material lookup map
  const materialMap = buildMaterialMap(draftContent.materials);

  const overlays: Overlay[] = [];
  let overlayId = 1;

  // Reorder tracks so text/sticker tracks come first (lower row numbers = visible on top)
  // Priority: text > sticker > other (video, audio, effects)
  const trackPriority = (type: string): number => {
    const t = type.toLowerCase();
    if (t === "text") return 0;
    if (t === "sticker") return 1;
    if (t === "video") return 2;
    if (t === "audio") return 3;
    return 4;
  };

  const sortedTracks = [...draftContent.tracks].sort((a, b) => {
    return trackPriority(a.type) - trackPriority(b.type);
  });

  // Process each track with new row assignments
  sortedTracks.forEach((track, trackIndex) => {
    // Use sorted track index as row number (text tracks get lower numbers)
    const row = trackIndex;

    // Process each segment in the track
    track.segments.forEach((segment) => {
      // Skip invisible segments
      if (segment.visible === false) return;

      // Find the material for this segment
      const materialEntry = materialMap.get(segment.material_id);

      if (!materialEntry) {
        console.warn(
          `Material not found for segment: ${segment.id}, material_id: ${segment.material_id}`,
        );
        return;
      }

      const { data: material, type: materialType } = materialEntry;

      // Create overlay based on track type or material type
      let overlay: Overlay | null = null;

      const trackType = track.type.toLowerCase();

      try {
        switch (trackType) {
          case "video":
            // Check if it's actually an image
            if (
              materialType === "images" ||
              material.remote_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            ) {
              overlay = createImageOverlay(
                segment,
                material,
                row,
                canvasWidth,
                canvasHeight,
                overlayId,
                fps,
              );
            } else {
              overlay = createVideoOverlay(
                segment,
                material,
                row,
                canvasWidth,
                canvasHeight,
                overlayId,
                fps,
              );
            }
            break;

          case "audio":
            overlay = createSoundOverlay(
              segment,
              material,
              row,
              overlayId,
              fps,
            );
            break;

          case "text":
            overlay = createTextOverlay(
              segment,
              material,
              row,
              canvasWidth,
              canvasHeight,
              overlayId,
              fps,
            );
            break;

          case "sticker":
            overlay = createStickerOverlay(
              segment,
              material,
              row,
              canvasWidth,
              canvasHeight,
              overlayId,
              fps,
            );
            break;

          case "effect":
          case "video_effect":
            // Effects are currently not directly supported in the new editor
            // Skip for now or log a warning
            console.warn(
              `Effect overlay type not yet supported: ${segment.id}`,
            );
            break;

          default:
            // Try to infer type from material type
            if (materialType === "videos") {
              overlay = createVideoOverlay(
                segment,
                material,
                row,
                canvasWidth,
                canvasHeight,
                overlayId,
                fps,
              );
            } else if (materialType === "audios") {
              overlay = createSoundOverlay(
                segment,
                material,
                row,
                overlayId,
                fps,
              );
            } else if (materialType === "texts") {
              overlay = createTextOverlay(
                segment,
                material,
                row,
                canvasWidth,
                canvasHeight,
                overlayId,
                fps,
              );
            } else if (materialType === "images") {
              overlay = createImageOverlay(
                segment,
                material,
                row,
                canvasWidth,
                canvasHeight,
                overlayId,
                fps,
              );
            } else if (materialType === "stickers") {
              overlay = createStickerOverlay(
                segment,
                material,
                row,
                canvasWidth,
                canvasHeight,
                overlayId,
                fps,
              );
            } else {
              console.warn(
                `Unknown track type: ${trackType} for segment: ${segment.id}`,
              );
            }
            break;
        }

        if (overlay) {
          overlays.push(overlay);
          overlayId++;
        }
      } catch (error) {
        console.error(
          `Error creating overlay for segment ${segment.id}:`,
          error,
        );
      }
    });
  });

  // Calculate total duration in frames
  const durationInFrames = microsecondsToFrames(draftContent.duration, fps);

  return {
    overlays,
    aspectRatio,
    durationInFrames,
    width: canvasWidth,
    height: canvasHeight,
  };
}

/**
 * Utility to validate mapped overlays
 */
export function validateOverlays(overlays: Overlay[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  overlays.forEach((overlay, index) => {
    const overlayId = overlay.id;
    const overlayType = overlay.type;

    if (!overlayId) {
      errors.push(`Overlay at index ${index} missing id`);
    }
    if (overlay.durationInFrames <= 0) {
      errors.push(
        `Overlay ${overlayId} has invalid duration: ${overlay.durationInFrames}`,
      );
    }
    if (overlay.from < 0) {
      errors.push(
        `Overlay ${overlayId} has negative start frame: ${overlay.from}`,
      );
    }
    if (!overlayType) {
      errors.push(`Overlay ${overlayId} missing type`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
