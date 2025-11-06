"use client";

import * as React from "react";

import { ArchiveDraftForm } from "@/components/archive-draft-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { VideoTaskListItem } from "@/drizzle/queries";

export function ArchiveDraftDialog({
  d,
  buttonLabel,
  trigger,
  draftVersion,
}: {
  d:
    | Pick<VideoTaskListItem, "id" | "draftId" | "videoName">
    | {
        id?: number | string;
        draftId: string;
        videoName?: string | null;
      };
  buttonLabel: string;
  trigger?: React.ReactNode;
  draftVersion?: string | null;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            {buttonLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{buttonLabel}</DialogTitle>
        </DialogHeader>
        <ArchiveDraftForm
          d={{ id: d.id ?? d.draftId, draftId: d.draftId }}
          videoName={d.videoName}
          draftVersion={draftVersion}
        />
      </DialogContent>
    </Dialog>
  );
}
