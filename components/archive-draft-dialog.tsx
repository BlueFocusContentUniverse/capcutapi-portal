"use client";

import * as React from "react";

import ArchiveDraftForm from "@/components/archive-draft-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DraftListItem } from "@/drizzle/queries";

export default function ArchiveDraftDialog({
  d,
  buttonLabel,
  trigger,
}: {
  d: Pick<DraftListItem, "id" | "draftId">;
  buttonLabel: string;
  trigger?: React.ReactNode;
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
        <ArchiveDraftForm d={d} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
