"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  calculateAspectRatioFromDimensions,
  DraftContent,
  DraftMaterials,
  DraftTrack,
  mapDraftToOverlays,
} from "@/lib/draft-to-overlay-mapper";
import { SHOW_MOBILE_WARNING } from "@/reactvideoeditor/constants";
import { createPexelsImageAdaptor } from "@/reactvideoeditor/pro/adaptors/pexels-image-adaptor";
import { createPexelsVideoAdaptor } from "@/reactvideoeditor/pro/adaptors/pexels-video-adaptor";
import { ReactVideoEditor } from "@/reactvideoeditor/pro/components/react-video-editor";
import { MobileWarningModal } from "@/reactvideoeditor/pro/components/shared/mobile-warning-modal";
import { CustomTheme } from "@/reactvideoeditor/pro/hooks/use-extended-theme-switcher";
import { AspectRatio, Overlay } from "@/reactvideoeditor/pro/types";
import { HttpRenderer } from "@/reactvideoeditor/pro/utils/http-renderer";

// Draft API response interface
interface DraftResponse {
  success: boolean;
  draft_id: string;
  content: {
    canvas_config: {
      width: number;
      height: number;
      ratio: string;
    };
    duration: number;
    fps: number;
    name: string;
    tracks: DraftTrack[];
    materials: DraftMaterials;
    [key: string]: any;
  };
}

export default function DraftEditorPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.draftId as string;

  // Set page title based on user's language
  usePageTitle("page_titles.rve_editor", { draftId });

  // State for draft data
  const [draftData, setDraftData] = useState<DraftResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Project ID for the video editor (using draft ID)
  const PROJECT_ID = `draft-${draftId}`;

  // Fetch draft data
  const fetchDraftData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/drafts/${draftId}/data`);

      if (!response.ok) {
        throw new Error(`Failed to fetch draft data: ${response.statusText}`);
      }

      const data: DraftResponse = await response.json();
      setDraftData(data);
    } catch (err) {
      console.error("Error fetching draft data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load draft data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (draftId) {
      fetchDraftData();
    }
  }, [draftId]);

  // Calculate aspect ratio from canvas dimensions
  const aspectRatio: AspectRatio = useMemo(() => {
    if (!draftData?.content?.canvas_config) {
      return "16:9";
    }
    const { width, height } = draftData.content.canvas_config;
    return calculateAspectRatioFromDimensions(width, height);
  }, [draftData]);

  // Get FPS from draft content (default to 30)
  const fps = useMemo(() => {
    return draftData?.content?.fps || 30;
  }, [draftData]);

  // Get canvas dimensions
  const { videoWidth, videoHeight } = useMemo(() => {
    if (!draftData?.content?.canvas_config) {
      return { videoWidth: 1920, videoHeight: 1080 };
    }
    return {
      videoWidth: draftData.content.canvas_config.width,
      videoHeight: draftData.content.canvas_config.height,
    };
  }, [draftData]);

  // Map draft data to overlays for the editor
  const overlays: Overlay[] = useMemo(() => {
    if (!draftData?.content) {
      return [];
    }

    const draftContent: DraftContent = {
      duration: draftData.content.duration,
      canvas_config: draftData.content.canvas_config,
      name: draftData.content.name,
      tracks: draftData.content.tracks || [],
      materials: draftData.content.materials || {},
    };

    const result = mapDraftToOverlays(draftContent, {
      fps,
      canvasWidth: videoWidth,
      canvasHeight: videoHeight,
    });

    return result.overlays;
  }, [draftData, fps, videoWidth, videoHeight]);

  // Handle theme changes
  const handleThemeChange = (themeId: string) => {
    console.log("Theme changed to:", themeId);
  };

  // Define available themes
  const availableThemes: CustomTheme[] = [
    {
      id: "rve",
      name: "RVE",
      className: "rve",
      color: "#3E8AF5",
    },
  ];

  // SSR Renderer for video export
  const ssrRenderer = React.useMemo(
    () =>
      new HttpRenderer("/api/latest/ssr", {
        type: "ssr",
        entryPoint: "/api/latest/ssr",
      }),
    [],
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-lg text-white mb-2">Loading editor...</div>
          <div className="text-sm text-gray-400">Draft ID: {draftId}</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-lg text-red-500 mb-4">Error: {error}</div>
          <Button onClick={() => router.push("/drafts")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Drafts
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!draftData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-lg text-white mb-4">No draft data available</div>
          <Button onClick={() => router.push("/drafts")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Drafts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full fixed inset-0 flex flex-col">
      {/* Editor */}
      <div className="flex-1 relative">
        <MobileWarningModal show={SHOW_MOBILE_WARNING} />
        <ReactVideoEditor
          projectId={PROJECT_ID}
          defaultOverlays={overlays}
          defaultAspectRatio={aspectRatio}
          isLoadingProject={loading}
          fps={fps}
          renderer={ssrRenderer}
          videoWidth={videoWidth}
          videoHeight={videoHeight}
          disabledPanels={[]}
          availableThemes={availableThemes}
          defaultTheme="dark"
          adaptors={{
            video: [
              createPexelsVideoAdaptor(
                "CEOcPegZJRoNztih7auwNoFZmIFTmlYoZTI0NgTRCUxkFhXORBhERORM",
              ),
            ],
            images: [
              createPexelsImageAdaptor(
                "CEOcPegZJRoNztih7auwNoFZmIFTmlYoZTI0NgTRCUxkFhXORBhERORM",
              ),
            ],
          }}
          onThemeChange={handleThemeChange}
          showDefaultThemes={true}
          sidebarWidth="clamp(350px, 25vw, 500px)"
          sidebarIconWidth="57.6px"
          showIconTitles={false}
        />
      </div>
    </div>
  );
}
