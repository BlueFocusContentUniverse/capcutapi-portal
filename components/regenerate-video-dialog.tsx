"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 只有非 completed 状态的任务才能重新生成，且未提交过
  const canRegenerate = renderStatus !== "completed" && !isSubmitted;

  const handleConfirm = async () => {
    if (!taskId) {
      const errorMsg = t("video_tasks.regenerate.error.no_task_id") || "Task ID is required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const result = await regenerateVideoAction(taskId);
      
      if (result.ok) {
        toast.success(
          result.message || 
          t("video_tasks.regenerate.success") || 
          "Video regeneration task has been submitted"
        );
        setIsSubmitted(true); // 标记为已提交，防止重复点击
        setOpen(false);
        // 刷新页面数据以显示更新后的状态
        router.refresh();
      } else {
        const errorMsg = result.error || 
          t("video_tasks.regenerate.error.failed") || 
          "Failed to regenerate video";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? error.message 
        : t("video_tasks.regenerate.error.failed") || "Failed to regenerate video";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canRegenerate) {
    return null;
  }

  // 当对话框关闭时，清除错误状态
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {buttonLabel || t("actions.regenerate") || "重新生成"}
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {t("video_tasks.regenerate.title") || "确认重新生成"}
          </DialogTitle>
          <DialogDescription>
            {t("video_tasks.regenerate.description") || 
              "确定要重新生成此视频吗？此操作将重新提交渲染任务。"}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              {t("actions.cancel") || "取消"}
            </Button>
          </DialogClose>
          <Button
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
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

