"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";

// Dynamic import for ReactJsonView to avoid SSR issues
const ReactJsonView = React.lazy(() =>
  import("@microlink/react-json-view").then((module) => ({
    default: module.default,
  })),
);

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DraftListItem } from "@/drizzle/queries";

interface DraftData {
  [key: string]: unknown;
}

export default function DraftDataViewDialog({
  d,
  buttonLabel,
}: {
  d: Pick<DraftListItem, "id" | "draftId">;
  buttonLabel: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [draftData, setDraftData] = React.useState<DraftData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDraftData = async () => {
    if (!open) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/drafts/${d.draftId}/data`);
      if (!response.ok) {
        throw new Error(`Failed to fetch draft data: ${response.statusText}`);
      }

      const data = await response.json();
      setDraftData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load draft data",
      );
      console.error("Error fetching draft data:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      fetchDraftData();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {t("drafts.view_data")} - {d.draftId}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-sm text-muted-foreground">
                {t("common.loading")}...
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}

          {draftData && !loading && !error && (
            <ScrollArea className="h-96 w-full rounded-md border p-4">
              <React.Suspense
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-sm text-muted-foreground">
                      Loading viewer...
                    </div>
                  </div>
                }
              >
                <ReactJsonView
                  src={draftData}
                  theme="monokai"
                  collapsed={1}
                  enableClipboard={true}
                  displayDataTypes={true}
                  displayObjectSize={true}
                  quotesOnKeys={true}
                  sortKeys={true}
                  style={{ fontSize: "12px" }}
                />
              </React.Suspense>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
