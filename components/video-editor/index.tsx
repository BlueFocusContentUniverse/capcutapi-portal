"use client";

import { useMemo, useState } from "react";

import { MaterialsPanel } from "./materials-panel";
import { TimelineTrack } from "./timeline-track";

interface Track {
  id: string;
  name: string;
  type: string;
  segments: Segment[];
  attribute: number;
  flag: number;
  is_default_name: boolean;
}

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

interface Materials {
  videos?: any[];
  audios?: any[];
  texts?: any[];
  stickers?: any[];
  effects?: any[];
  video_effects?: any[];
  [key: string]: any;
}

interface VideoEditorProps {
  tracks: Track[];
  materials: Materials;
  duration: number;
}

// Track type colors
const TRACK_COLORS: Record<string, string> = {
  video: "bg-blue-600",
  audio: "bg-green-600",
  effect: "bg-purple-600",
  text: "bg-orange-600",
  sticker: "bg-pink-600",
  default: "bg-gray-600",
};

// Convert microseconds to pixels (1 second = 100 pixels)
const PIXELS_PER_SECOND = 100;

export function VideoEditor({ tracks, materials, duration }: VideoEditorProps) {
  const [zoom, setZoom] = useState(1);
  const [showMaterials, setShowMaterials] = useState(true);

  // Calculate timeline width based on duration
  const timelineWidth = useMemo(() => {
    const seconds = duration / 1000000;
    return seconds * PIXELS_PER_SECOND * zoom;
  }, [duration, zoom]);

  // Create material lookup map for quick access
  const materialMap = useMemo(() => {
    const map = new Map<string, any>();

    if (materials) {
      Object.keys(materials).forEach((key) => {
        const items = materials[key];
        if (Array.isArray(items)) {
          items.forEach((item) => {
            if (item.id) {
              map.set(item.id, { ...item, type: key });
            }
          });
        }
      });
    }

    return map;
  }, [materials]);

  // Generate time markers (every second)
  const timeMarkers = useMemo(() => {
    const seconds = Math.ceil(duration / 1000000);
    const markers = [];

    for (let i = 0; i <= seconds; i++) {
      markers.push({
        time: i,
        position: i * PIXELS_PER_SECOND * zoom,
      });
    }

    return markers;
  }, [duration, zoom]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.2));
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Timeline Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Timeline Controls */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              -
            </button>
            <span className="text-sm text-gray-300 min-w-[60px] text-center">
              {(zoom * 100).toFixed(0)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              +
            </button>
          </div>
          <div className="text-sm text-gray-400">Tracks: {tracks.length}</div>
          <div className="flex-1" />
          <button
            onClick={() => setShowMaterials(!showMaterials)}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            {showMaterials ? "Hide Materials" : "Show Materials"}
          </button>
        </div>

        {/* Timeline Area */}
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          <div className="relative min-h-full">
            {/* Timeline Ruler */}
            <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
              <div className="flex" style={{ marginLeft: "200px" }}>
                <div
                  className="relative h-10 border-l border-gray-600"
                  style={{ width: `${timelineWidth}px` }}
                >
                  {timeMarkers.map((marker) => (
                    <div
                      key={marker.time}
                      className="absolute top-0 h-full border-l border-gray-600"
                      style={{ left: `${marker.position}px` }}
                    >
                      <span className="absolute top-1 left-1 text-xs text-gray-400">
                        {marker.time}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracks */}
            <div className="relative">
              {tracks.map((track, index) => (
                <TimelineTrack
                  key={track.id}
                  track={track}
                  materialMap={materialMap}
                  timelineWidth={timelineWidth}
                  pixelsPerSecond={PIXELS_PER_SECOND * zoom}
                  trackColor={TRACK_COLORS[track.type] || TRACK_COLORS.default}
                  isEven={index % 2 === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Materials Panel */}
      {showMaterials && <MaterialsPanel materials={materials} />}
    </div>
  );
}
