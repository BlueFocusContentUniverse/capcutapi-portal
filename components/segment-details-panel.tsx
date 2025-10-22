"use client";

import { formatTime } from "@/lib/editor-utils";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface SegmentDetailsPanelProps {
  segment: any | null;
  material: any | null;
  trackType: string;
  onClose: () => void;
}

export function SegmentDetailsPanel({
  segment,
  material,
  trackType,
  onClose,
}: SegmentDetailsPanelProps) {
  if (!segment) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 text-gray-400 text-sm">
        Select a segment to view details
      </div>
    );
  }

  const startTime = segment.target_timerange.start;
  const duration = segment.target_timerange.duration;
  const endTime = startTime + duration;

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
      <Card className="bg-transparent border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-white">
            Segment Details
          </CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Segment Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Segment</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="text-white font-mono text-xs">
                  {segment.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white capitalize">{trackType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Visible:</span>
                <span className="text-white">
                  {segment.visible !== false ? "✓ Yes" : "✗ No"}
                </span>
              </div>
            </div>
          </div>

          {/* Timing Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Timing</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Start:</span>
                <span className="text-white font-mono">
                  {formatTime(startTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white font-mono">
                  {formatTime(duration)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End:</span>
                <span className="text-white font-mono">
                  {formatTime(endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Material Info */}
          {material && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Material
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white truncate max-w-[180px]">
                    {material.name ||
                      material.material_name ||
                      material.text ||
                      "Unknown"}
                  </span>
                </div>
                {material.materialType && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">
                      {material.materialType}
                    </span>
                  </div>
                )}
                {material.remote_url && (
                  <div>
                    <span className="text-gray-400">URL:</span>
                    <a
                      href={material.remote_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs block truncate mt-1"
                    >
                      {material.remote_url}
                    </a>
                  </div>
                )}
                {material.content && (
                  <div>
                    <span className="text-gray-400">Content:</span>
                    <div className="mt-1 p-2 bg-gray-900 rounded text-xs text-gray-300 max-h-32 overflow-y-auto">
                      {typeof material.content === "string"
                        ? (() => {
                            try {
                              const parsed = JSON.parse(material.content);
                              return parsed.text || material.content;
                            } catch {
                              return material.content.slice(0, 200);
                            }
                          })()
                        : JSON.stringify(material.content, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Properties */}
          {segment.render_index !== undefined && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Rendering
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Render Index:</span>
                  <span className="text-white">{segment.render_index}</span>
                </div>
                {segment.track_render_index !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Track Render Index:</span>
                    <span className="text-white">
                      {segment.track_render_index}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transform Info (for video segments) */}
          {segment.clip && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Transform
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Position:</span>
                  <span className="text-white font-mono">
                    x: {segment.clip.transform.x.toFixed(2)}, y:{" "}
                    {segment.clip.transform.y.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scale:</span>
                  <span className="text-white font-mono">
                    x: {segment.clip.scale.x.toFixed(2)}, y:{" "}
                    {segment.clip.scale.y.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rotation:</span>
                  <span className="text-white">
                    {segment.clip.rotation.toFixed(2)}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Alpha:</span>
                  <span className="text-white">
                    {(segment.clip.alpha * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Volume Info (for audio segments) */}
          {segment.volume !== undefined && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Audio</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Volume:</span>
                  <span className="text-white">
                    {(segment.volume * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
