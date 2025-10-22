"use client";

import { useMemo } from "react";

interface Segment {
  id: string;
  material_id: string;
  target_timerange: {
    start: number;
    duration: number;
  };
  render_index?: number;
  visible?: boolean;
  [key: string]: any;
}

interface TimelineSegmentProps {
  segment: Segment;
  material: any;
  startPixels: number;
  durationPixels: number;
  trackType: string;
  trackColor: string;
}

export function TimelineSegment({
  segment,
  material,
  startPixels,
  durationPixels,
  trackType,
  trackColor,
}: TimelineSegmentProps) {
  // Get display name based on material type
  const displayName = useMemo(() => {
    if (!material) {
      return `Unknown (${segment.material_id.slice(0, 8)}...)`;
    }

    // Try different name properties based on material type
    if (material.name) return material.name;
    if (material.material_name) return material.material_name;
    if (material.text) return material.text;
    if (material.content) {
      try {
        const parsed = JSON.parse(material.content);
        if (parsed.text) return parsed.text;
      } catch {
        // Ignore parsing errors
      }
    }

    return `${trackType} segment`;
  }, [material, segment.material_id, trackType]);

  // Determine segment color based on track type and material
  const segmentColor = useMemo(() => {
    const baseColors: Record<string, string> = {
      video: "bg-blue-500",
      audio: "bg-green-500",
      effect: "bg-purple-500",
      text: "bg-orange-500",
      sticker: "bg-pink-500",
      default: "bg-gray-500",
    };

    return baseColors[trackType] || baseColors.default;
  }, [trackType]);

  // Get material details for tooltip
  const materialInfo = useMemo(() => {
    if (!material) return "No material data";

    const info = [];
    if (material.type) info.push(`Type: ${material.type}`);
    if (material.duration)
      info.push(`Duration: ${(material.duration / 1000000).toFixed(2)}s`);
    if (material.remote_url) info.push(`URL: ${material.remote_url}`);

    return info.join(" | ") || "Material details";
  }, [material]);

  return (
    <div
      className={`absolute top-1 bottom-1 ${segmentColor} rounded border border-gray-700 hover:border-white transition-all cursor-pointer overflow-hidden group`}
      style={{
        left: `${startPixels}px`,
        width: `${Math.max(durationPixels, 2)}px`,
      }}
      title={`${displayName}\n${materialInfo}\nStart: ${(segment.target_timerange.start / 1000000).toFixed(2)}s\nDuration: ${(segment.target_timerange.duration / 1000000).toFixed(2)}s`}
    >
      {/* Segment content */}
      <div className="h-full px-2 py-1 flex items-center">
        <div className="text-xs text-white font-medium truncate">
          {durationPixels > 50 ? displayName : ""}
        </div>
      </div>

      {/* Resize handles */}
      <div className="absolute inset-y-0 left-0 w-1 bg-white opacity-0 group-hover:opacity-50 cursor-ew-resize" />
      <div className="absolute inset-y-0 right-0 w-1 bg-white opacity-0 group-hover:opacity-50 cursor-ew-resize" />

      {/* Selection overlay */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 pointer-events-none" />
    </div>
  );
}
