"use client";

import * as React from "react";

import GenerateVideoForm from "@/components/generate-video-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function GenerateVideoDialog({
  d,
  buttonLabel,
}: {
  d: any;
  buttonLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{buttonLabel}</DialogTitle>
        </DialogHeader>
        <GenerateVideoForm d={d} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
