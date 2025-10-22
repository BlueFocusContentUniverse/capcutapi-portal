"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoEditor } from "@/components/video-editor";

interface DraftContent {
  content: {
    duration: number;
    canvas_config: {
      width: number;
      height: number;
      ratio: string;
    };
    tracks: any[];
    materials: any;
  };
  draft_id: string;
  success: boolean;
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.draftId as string;

  const [draftData, setDraftData] = useState<DraftContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<
    { version: string; created_at: number }[]
  >([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);

  const fetchVersions = async () => {
    setLoadingVersions(true);
    setVersionError(null);

    try {
      const response = await fetch(`/api/drafts/${draftId}/versions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch versions: ${response.statusText}`);
      }

      const data = await response.json();
      // Assuming the API returns an array of versions or an object with versions
      const versionsList = Array.isArray(data) ? data : data.versions || [];
      setVersions(versionsList);
    } catch (err) {
      setVersionError(
        err instanceof Error ? err.message : "Failed to load versions",
      );
      console.error("Error fetching versions:", err);
    } finally {
      setLoadingVersions(false);
    }
  };

  const fetchDraftData = async () => {
    try {
      setLoading(true);
      // Fetch from the API endpoint
      let url = `/api/drafts/${draftId}/data`;
      if (selectedVersion) {
        url = `/api/drafts/${draftId}/versions/${selectedVersion}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch draft data: ${response.statusText}`);
      }

      const data = await response.json();
      setDraftData(data);
      setError(null);
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
      fetchVersions();
      fetchDraftData();
    }
  }, [draftId]);

  useEffect(() => {
    if (draftId && selectedVersion) {
      fetchDraftData();
    }
  }, [selectedVersion]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-lg text-white mb-2">Loading editor...</div>
          <div className="text-sm text-gray-400">Draft ID: {draftId}</div>
        </div>
      </div>
    );
  }

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
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="border-b border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/drafts")}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">
              Video Editor - {draftData.draft_id}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Duration: {(draftData.content.duration / 1000000).toFixed(2)}s |
              Canvas: {draftData.content.canvas_config.width}x
              {draftData.content.canvas_config.height}
            </p>
          </div>

          {/* Version Selector */}
          <div className="flex items-center gap-2">
            {loadingVersions && (
              <div className="text-xs text-gray-400">Loading versions...</div>
            )}

            {versionError && (
              <div className="text-xs text-red-400">{versionError}</div>
            )}

            {!loadingVersions && versions.length > 0 && (
              <>
                <label className="text-sm font-medium text-gray-300">
                  Version:
                </label>
                <Select
                  value={selectedVersion || ""}
                  onValueChange={setSelectedVersion}
                >
                  <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Current version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((version, i) => (
                      <SelectItem key={i} value={version.version}>
                        {version.version}
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(version.created_at * 1000).toLocaleString()}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <VideoEditor
          tracks={draftData.content.tracks}
          materials={draftData.content.materials}
          duration={draftData.content.duration}
        />
      </main>
    </div>
  );
}
