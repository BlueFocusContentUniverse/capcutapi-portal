"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/video-player/video-player";

interface Materials {
  videos?: any[];
  audios?: any[];
  texts?: any[];
  stickers?: any[];
  effects?: any[];
  video_effects?: any[];
  [key: string]: any;
}

interface MaterialsPanelProps {
  materials: Materials;
}

export function MaterialsPanel({ materials }: MaterialsPanelProps) {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null,
  );
  const [playingMaterial, setPlayingMaterial] = useState<{
    id: string;
    type: string;
    data: any;
  } | null>(null);

  // Count materials by type
  const materialCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (materials) {
      Object.keys(materials).forEach((key) => {
        const items = materials[key];
        if (Array.isArray(items)) {
          counts[key] = items.length;
        }
      });
    }
    return counts;
  }, [materials]);

  // Get all materials with their type
  const allMaterials = useMemo(() => {
    const items: Array<{ id: string; type: string; data: any }> = [];
    if (materials) {
      Object.keys(materials).forEach((key) => {
        const materialItems = materials[key];
        if (Array.isArray(materialItems)) {
          materialItems.forEach((item) => {
            if (item.id) {
              items.push({ id: item.id, type: key, data: item });
            }
          });
        }
      });
    }
    return items;
  }, [materials]);

  // Material type icons
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      videos: "🎥",
      audios: "🔊",
      texts: "📝",
      stickers: "🎨",
      effects: "✨",
      video_effects: "🎬",
    };
    return icons[type] || "📦";
  };

  // Material type colors
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      videos: "bg-blue-600",
      audios: "bg-green-600",
      texts: "bg-orange-600",
      stickers: "bg-pink-600",
      effects: "bg-purple-600",
      video_effects: "bg-indigo-600",
    };
    return colors[type] || "bg-gray-600";
  };

  // Get display name for a material
  const getDisplayName = (material: any, type: string) => {
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
    return `${type.slice(0, -1)} ${material.id.slice(0, 8)}`;
  };

  // Check if material is playable (video or audio)
  const isPlayable = (type: string) => {
    return type === "videos" || type === "audios";
  };

  // Handle play media
  const handlePlayMedia = (
    item: { id: string; type: string; data: any },
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    setPlayingMaterial(item);
  };

  // Render material item
  const renderMaterialItem = (item: {
    id: string;
    type: string;
    data: any;
  }) => {
    const isSelected = selectedMaterialId === item.id;
    return (
      <div
        key={item.id}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? "bg-gray-700 border-blue-500"
            : "bg-gray-800 border-gray-700 hover:border-gray-600"
        }`}
        onClick={() => setSelectedMaterialId(isSelected ? null : item.id)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded flex items-center justify-center text-xl shrink-0 ${getTypeColor(item.type)}`}
          >
            {getTypeIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-sm font-medium text-white truncate">
              {getDisplayName(item.data, item.type)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ID: {item.id.slice(0, 12)}...
            </div>
            {item.data.duration && (
              <div className="text-xs text-gray-400">
                Duration: {(item.data.duration / 1000000).toFixed(2)}s
              </div>
            )}
            {item.data.remote_url && (
              <div className="text-xs text-blue-400 truncate mt-1 max-w-[180px]">
                {item.data.remote_url}
              </div>
            )}
          </div>
        </div>
        {isPlayable(item.type) && item.data.remote_url && (
          <button
            onClick={(e) => handlePlayMedia(item, e)}
            className="shrink-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors self-center"
            title="Play media"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
        )}

        {/* Expanded details when selected */}
        {isSelected && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs space-y-2">
              {Object.entries(item.data).map(([key, value]) => {
                // Skip very long values and complex objects for display
                if (
                  key === "id" ||
                  typeof value === "object" ||
                  typeof value === "function"
                ) {
                  return null;
                }
                return (
                  <div key={key} className="flex justify-between gap-2">
                    <span className="text-gray-400 capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span className="text-white truncate max-w-[200px]">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render materials by type
  const renderMaterialsByType = (type: string) => {
    const items = materials[type];
    if (!Array.isArray(items) || items.length === 0) {
      return (
        <div className="text-center text-gray-400 text-sm py-8">
          No {type} in this draft
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item) =>
          renderMaterialItem({ id: item.id, type, data: item }),
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
      <Card className="bg-transparent border-0 flex-1 flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle className="text-lg font-semibold text-white">
            Materials
          </CardTitle>
          <div className="text-xs text-gray-400 mt-2">
            Total: {allMaterials.length} materials
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900 mb-3">
              <TabsTrigger value="all" className="text-xs">
                All ({allMaterials.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="text-xs">
                Videos ({materialCounts.videos || 0})
              </TabsTrigger>
              <TabsTrigger value="audios" className="text-xs">
                Audio ({materialCounts.audios || 0})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="all" className="mt-0">
                {allMaterials.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No materials in this draft
                  </div>
                ) : (
                  <div className="space-y-2 pr-4">
                    {allMaterials.map((item) => renderMaterialItem(item))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="mt-0">
                <div className="pr-4">{renderMaterialsByType("videos")}</div>
              </TabsContent>

              <TabsContent value="audios" className="mt-0">
                <div className="pr-4">{renderMaterialsByType("audios")}</div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Additional material types as separate sections */}
          {(materialCounts.texts || 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-sm font-medium text-gray-300 mb-2">
                Texts ({materialCounts.texts})
              </div>
            </div>
          )}
          {(materialCounts.stickers || 0) > 0 && (
            <div className="mt-2">
              <div className="text-sm font-medium text-gray-300 mb-2">
                Stickers ({materialCounts.stickers})
              </div>
            </div>
          )}
          {(materialCounts.effects || 0) > 0 && (
            <div className="mt-2">
              <div className="text-sm font-medium text-gray-300 mb-2">
                Effects ({materialCounts.effects})
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Player Dialog */}
      <Dialog
        open={playingMaterial !== null}
        onOpenChange={(open) => !open && setPlayingMaterial(null)}
      >
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {playingMaterial &&
                getDisplayName(playingMaterial.data, playingMaterial.type)}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {playingMaterial && playingMaterial.data.remote_url && (
              <VideoPlayer
                src={playingMaterial.data.remote_url}
                title={getDisplayName(
                  playingMaterial.data,
                  playingMaterial.type,
                )}
                aspectRatio={
                  playingMaterial.type === "audios" ? "16/3" : "16/9"
                }
                autoplay={true}
              />
            )}
          </div>
          {playingMaterial && (
            <div className="mt-4 text-sm text-gray-400 space-y-1">
              <div>
                <span className="font-medium">Type:</span>{" "}
                {playingMaterial.type}
              </div>
              <div>
                <span className="font-medium">ID:</span> {playingMaterial.id}
              </div>
              {playingMaterial.data.duration && (
                <div>
                  <span className="font-medium">Duration:</span>{" "}
                  {(playingMaterial.data.duration / 1000000).toFixed(2)}s
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
