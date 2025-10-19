"use client";

import Image from "next/image";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { archiveDraftAction } from "@/app/(main)/video-tasks/actions";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DraftListItem } from "@/drizzle/queries";

export default function ArchiveDraftForm({
  d,
  onSuccess,
}: {
  d: Pick<DraftListItem, "id" | "draftId">;
  onSuccess?: () => void;
}) {
  const { t } = useTranslation();
  const [directoryPath, setDirectoryPath] = React.useState<string>("");
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const action = async (formData: FormData) => {
    if (!directoryPath) {
      return;
    }
    formData.set("draft_folder", directoryPath);
    const res = await archiveDraftAction(undefined, formData);
    if (res?.ok) {
      onSuccess?.();
      formRef.current?.reset();
      setDirectoryPath("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <form action={action} ref={formRef} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor={`archive_draft_id_${d.id}`}>
          {t("drafts.fields.draft_id")}
        </Label>
        <Input
          id={`archive_draft_id_${d.id}`}
          defaultValue={d?.draftId ?? ""}
          disabled
        />
        <input type="hidden" name="draft_id" value={d?.draftId ?? ""} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`draft_folder_${d.id}`}>
          {t("drafts.fields.draft_folder")}
        </Label>
        <Input
          id={`draft_folder_${d.id}`}
          name="draft_folder"
          value={directoryPath}
          onChange={(e) => setDirectoryPath(e.target.value)}
          placeholder={t("drafts.placeholders.draft_folder") ?? ""}
        />
        {/* Visual Reference: Draft Location in Global Settings */}
        <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-2">
          <p className="text-xs text-gray-600 mb-2 font-medium">
            📍 {t("drafts.tips.location_hint")}
          </p>
          <Image
            src="/archive-tip.jpg"
            alt="Draft Location Setting Reference"
            width={400}
            height={250}
            className="w-full rounded border border-gray-300"
            priority={false}
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            {t("actions.cancel")}
          </Button>
        </DialogClose>
        <Button type="submit" disabled={!directoryPath}>
          {t("actions.archive_draft")}
        </Button>
      </DialogFooter>
    </form>
  );
}
