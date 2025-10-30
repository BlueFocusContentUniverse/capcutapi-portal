"use client";

import { TimelineSegment } from "./timeline-segment";

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

interface Track {
  id: string;
  name: string;
  type: string;
  segments: Segment[];
  attribute: number;
  flag: number;
  is_default_name: boolean;
}

interface TimelineTrackProps {
  track: Track;
  materialMap: Map<string, any>;
  timelineWidth: number;
  pixelsPerSecond: number;
  trackColor: string;
  isEven: boolean;
}

export function TimelineTrack({
  track,
  materialMap,
  timelineWidth,
  pixelsPerSecond,
  trackColor,
  isEven,
}: TimelineTrackProps) {
  const bgClass = isEven ? "bg-gray-800" : "bg-gray-850";

  return (
    <div
      className={`flex border-b border-gray-700 ${bgClass} hover:bg-gray-750 transition-colors`}
      style={{ minHeight: "60px" }}
    >
      {/* Track Label */}
      <div
        className={`sticky left-0 z-20 w-[200px] shrink-0 flex items-center px-3 py-2 border-r border-gray-700 ${bgClass}`}
      >
        <div className="flex items-center gap-2 w-full">
          <div
            className={`w-3 h-3 rounded ${trackColor} shrink-0`}
            title={track.type}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {track.name}
            </div>
            <div className="text-xs text-gray-400">
              {track.type} ({track.segments.length})
            </div>
          </div>
        </div>
      </div>

      {/* Track Timeline */}
      <div className="relative flex-1">
        <div
          className="relative h-full"
          style={{ width: `${timelineWidth}px`, minHeight: "60px" }}
        >
          {track.segments.map((segment) => {
            const material = materialMap.get(segment.material_id);

            // Calculate position and width based on timerange
            // time is in microseconds, convert to pixels
            const startPixels =
              (segment.target_timerange.start / 1000000) * pixelsPerSecond;
            const durationPixels =
              (segment.target_timerange.duration / 1000000) * pixelsPerSecond;

            return (
              <TimelineSegment
                key={segment.id}
                segment={segment}
                material={material}
                startPixels={startPixels}
                durationPixels={durationPixels}
                trackType={track.type}
                trackColor={trackColor}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
