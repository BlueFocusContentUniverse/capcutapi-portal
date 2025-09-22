"use client";

import * as React from "react";

import { generateVideoAction } from "@/app/(main)/drafts/actions";
import ParamSelect from "@/components/param-select";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GenerateVideoForm({
  d,
  onSuccess,
}: {
  d: any;
  onSuccess?: () => void;
}) {
  const initialFramerate = React.useMemo(() => {
    if (d?.fps === 30) return "30fps";
    if (d?.fps === 50) return "50fps";
    if (d?.fps === 60) return "60fps";
    return "";
  }, [d]);

  const initialResolution = React.useMemo(() => {
    if (d?.width === 1280 && d?.height === 720) return "720P";
    if (d?.width === 1920 && d?.height === 1080) return "1080P";
    if (d?.width === 2560 && d?.height === 1440) return "2K";
    if (d?.width === 3840 && d?.height === 2160) return "4K";
    return "";
  }, [d]);

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const action = async (formData: FormData) => {
    const res = await generateVideoAction(undefined, formData);
    if (res?.ok) {
      onSuccess?.();
      formRef.current?.reset();
    }
  };

  return (
    <form action={action} ref={formRef} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`draft_id_${d.id}`}>draft_id</Label>
        <Input
          id={`draft_id_${d.id}`}
          name="draft_id"
          defaultValue={d?.draftId ?? ""}
          required
        />
      </div>
      <ParamSelect
        id={`framerate_${d.id}`}
        name="framerate"
        label="framerate"
        options={["30fps", "50fps", "60fps"]}
        defaultValue={initialFramerate}
      />
      <div className="grid gap-2">
        <Label htmlFor={`name_${d.id}`}>name</Label>
        <Input
          id={`name_${d.id}`}
          name="name"
          defaultValue={d?.draftName ?? ""}
          placeholder="my-video.mp4"
        />
      </div>
      <ParamSelect
        id={`resolution_${d.id}`}
        name="resolution"
        label="resolution"
        options={["720P", "1080P", "2K", "4K"]}
        defaultValue={initialResolution}
      />
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Submit</Button>
      </DialogFooter>
    </form>
  );
}
