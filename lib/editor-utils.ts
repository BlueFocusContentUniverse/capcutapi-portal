/**
 * Utility functions for the video editor
 */

/**
 * Convert microseconds to seconds
 */
export function microsecondsToSeconds(microseconds: number): number {
  return microseconds / 1000000;
}

/**
 * Convert seconds to microseconds
 */
export function secondsToMicroseconds(seconds: number): number {
  return seconds * 1000000;
}

/**
 * Format time in microseconds to display format (MM:SS.mmm)
 */
export function formatTime(microseconds: number): string {
  const totalSeconds = microseconds / 1000000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

/**
 * Create a material lookup map from materials object
 * This allows O(1) lookup of materials by ID
 */
export function createMaterialMap(materials: any): Map<string, any> {
  const map = new Map<string, any>();

  if (!materials) return map;

  // Iterate through all material types
  Object.keys(materials).forEach((materialType) => {
    const items = materials[materialType];

    if (Array.isArray(items)) {
      items.forEach((item) => {
        if (item.id) {
          // Store the item with its type information
          map.set(item.id, {
            ...item,
            materialType,
          });
        }
      });
    }
  });

  return map;
}

/**
 * Get material name based on material type
 */
export function getMaterialName(material: any): string {
  if (!material) return "Unknown";

  // Try different name properties based on material type
  if (material.name) return material.name;
  if (material.material_name) return material.material_name;
  if (material.text) return material.text;

  // For text materials, try to parse content
  if (material.content && typeof material.content === "string") {
    try {
      const parsed = JSON.parse(material.content);
      if (parsed.text) return parsed.text;
    } catch {
      // Ignore parsing errors
    }
  }

  return `${material.materialType || "Unknown"} material`;
}

/**
 * Calculate segment position in pixels
 */
export function calculateSegmentPosition(
  startMicroseconds: number,
  pixelsPerSecond: number,
): number {
  return (startMicroseconds / 1000000) * pixelsPerSecond;
}

/**
 * Calculate segment width in pixels
 */
export function calculateSegmentWidth(
  durationMicroseconds: number,
  pixelsPerSecond: number,
): number {
  return Math.max((durationMicroseconds / 1000000) * pixelsPerSecond, 2);
}

/**
 * Get color class for track type
 */
export function getTrackColor(trackType: string): string {
  const colors: Record<string, string> = {
    video: "bg-blue-600",
    audio: "bg-green-600",
    effect: "bg-purple-600",
    text: "bg-orange-600",
    sticker: "bg-pink-600",
  };

  return colors[trackType] || "bg-gray-600";
}

/**
 * Get color class for segment type
 */
export function getSegmentColor(trackType: string): string {
  const colors: Record<string, string> = {
    video: "bg-blue-500",
    audio: "bg-green-500",
    effect: "bg-purple-500",
    text: "bg-orange-500",
    sticker: "bg-pink-500",
  };

  return colors[trackType] || "bg-gray-500";
}

/**
 * Validate track data
 */
export function validateTrack(track: any): boolean {
  return (
    track &&
    typeof track.id === "string" &&
    typeof track.name === "string" &&
    typeof track.type === "string" &&
    Array.isArray(track.segments)
  );
}

/**
 * Validate segment data
 */
export function validateSegment(segment: any): boolean {
  return (
    segment &&
    typeof segment.id === "string" &&
    typeof segment.material_id === "string" &&
    segment.target_timerange &&
    typeof segment.target_timerange.start === "number" &&
    typeof segment.target_timerange.duration === "number"
  );
}

/**
 * Sort tracks by type and name
 */
export function sortTracks(tracks: any[]): any[] {
  const typeOrder = ["video", "audio", "text", "effect", "sticker"];

  return [...tracks].sort((a, b) => {
    const aIndex = typeOrder.indexOf(a.type);
    const bIndex = typeOrder.indexOf(b.type);

    if (aIndex !== bIndex) {
      return (
        (aIndex === -1 ? Infinity : aIndex) -
        (bIndex === -1 ? Infinity : bIndex)
      );
    }

    return a.name.localeCompare(b.name);
  });
}

/**
 * Get segment conflicts (overlapping segments in the same track)
 */
export function getSegmentConflicts(segments: any[]): Set<string> {
  const conflicts = new Set<string>();

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const seg1 = segments[i];
      const seg2 = segments[j];

      const start1 = seg1.target_timerange.start;
      const end1 = start1 + seg1.target_timerange.duration;
      const start2 = seg2.target_timerange.start;
      const end2 = start2 + seg2.target_timerange.duration;

      // Check for overlap
      if (start1 < end2 && start2 < end1) {
        conflicts.add(seg1.id);
        conflicts.add(seg2.id);
      }
    }
  }

  return conflicts;
}
