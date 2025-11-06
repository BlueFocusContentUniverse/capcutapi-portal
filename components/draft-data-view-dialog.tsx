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

type DraftData = Record<string, unknown> | object;
interface DraftDataViewDialogProps {
  draftData: DraftData;
  draftId: string;
  trigger?: React.ReactNode;
}

export default function DraftDataViewDialog({
  draftData,
  draftId,
  trigger,
}: DraftDataViewDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {t("drafts.view_data")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {t("drafts.view_data")} - {draftId}
          </DialogTitle>
        </DialogHeader>

        {/* Version Selector */}

        <div className="flex-1 min-h-0">
          {draftData && (
            <ScrollArea className="h-128 w-full rounded-md border p-4">
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
                  collapsed={3}
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
