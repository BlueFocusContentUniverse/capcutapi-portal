"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { regenerateVideoAction } from "@/app/(main)/video-tasks/actions";

export function RegenerateVideoDialog({
  taskId,
  renderStatus,
  buttonLabel,
}: {
  taskId: string;
  renderStatus?: string;
  buttonLabel?: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // 只有非 completed 状态的任务才能重新生成
  const canRegenerate = renderStatus !== "completed";

  const handleConfirm = async () => {
    if (!taskId) {
      toast.error(t("video_tasks.regenerate.error.no_task_id") || "Task ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await regenerateVideoAction(taskId);
      
      if (result.ok) {
        toast.success(
          result.message || 
          t("video_tasks.regenerate.success") || 
          "Video regeneration task has been submitted"
        );
        setOpen(false);
      } else {
        toast.error(
          result.error || 
          t("video_tasks.regenerate.error.failed") || 
          "Failed to regenerate video"
        );
      }
    } catch (error) {
      console.error("Regenerate video error:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : t("video_tasks.regenerate.error.failed") || "Failed to regenerate video"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!canRegenerate) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          {buttonLabel || t("actions.regenerate") || "重新生成"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("video_tasks.regenerate.title") || "确认重新生成"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("video_tasks.regenerate.description") || 
              "确定要重新生成此视频吗？此操作将重新提交渲染任务。"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("actions.cancel") || "取消"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("actions.processing") || "处理中..."}
              </>
            ) : (
              t("actions.confirm") || "确认"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

