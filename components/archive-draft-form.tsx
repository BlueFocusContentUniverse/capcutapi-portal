"use client";

import Image from "next/image";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { saveDraftAction } from "@/app/(main)/video-tasks/actions";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DraftListItem } from "@/drizzle/queries";

export default function ArchiveDraftForm({
  d,
}: {
  d: Pick<DraftListItem, "id" | "draftId">;
}) {
  const { t } = useTranslation();
  const [directoryPath, setDirectoryPath] = React.useState<string>("");
  const formRef = React.useRef<HTMLFormElement | null>(null);

  const [state, formAction, isPending] = React.useActionState(
    saveDraftAction,
    undefined,
  );

  React.useEffect(() => {
    if (state?.ok) {
      toast.success(t("drafts.archive_success"));
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, t]);

  return (
    <form action={formAction} ref={formRef} className="space-y-4">
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

      {/* Success state with download link */}
      {state?.ok && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800 mb-2">
            ✅ {t("drafts.archive_success")}
          </p>
          <a
            href={state.draftUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            📥 {t("drafts.download_draft")}
          </a>
        </div>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            {t("actions.cancel")}
          </Button>
        </DialogClose>
        <Button type="submit" disabled={!directoryPath || isPending}>
          {isPending ? t("actions.archiving") : t("actions.archive_draft")}
        </Button>
      </DialogFooter>

      {/* Full screen loading mask */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-lg font-medium text-gray-900">
                {t("drafts.archiving_in_progress")}
              </p>
              <p className="text-sm text-gray-500">{t("drafts.please_wait")}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
