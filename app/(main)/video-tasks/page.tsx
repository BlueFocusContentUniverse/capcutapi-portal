import type { Metadata } from "next";
import Link from "next/link";

import { ArchiveDraftDialog } from "@/components/archive-draft-dialog";
import { RegenerateVideoDialog } from "@/components/regenerate-video-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { serverTranslation } from "@/lib/i18n/server";

import { fetchVideoTasksFromApi } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await serverTranslation();
  return {
    title: t("page_titles.video_tasks"),
  };
}

type SearchParams = Promise<{
  page?: string;
  pageSize?: string;
  search?: string;
  video_name?: string;
  startDate?: string;
  endDate?: string;
  render_status?: string;
}>;

export default async function VideoTasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { t } = await serverTranslation("translation");
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page ?? 1));
  const pageSize = Math.max(1, Math.min(100, Number(params?.pageSize ?? 50)));
  const draftId = params?.search; // reuse existing search box as draft_id filter
  const videoName = params?.video_name;
  const renderStatus = params?.render_status;
  const startDate = params?.startDate;
  const endDate = params?.endDate;

  const {
    items,
    total,
    totalPages: apiTotalPages,
  } = await fetchVideoTasksFromApi({
    page,
    pageSize,
    draftId,
    videoName,
    renderStatus,
    startDate,
    endDate,
  });
  const totalPages =
    apiTotalPages ?? Math.max(1, Math.ceil((total || 0) / pageSize));

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div className="h-full flex flex-col space-y-4">
      <h1 className="text-xl font-semibold">{t("video_tasks.title")}</h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <form action="" className="flex items-center gap-2">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>{t("video_tasks.filters.draft_id")}</span>
              <Input
                id="draftId"
                name="search"
                defaultValue={draftId}
                placeholder={t("video_tasks.filters.draft_id_placeholder")}
                className="w-48"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>{t("video_tasks.filters.video_name")}</span>
              <Input
                id="videoName"
                name="video_name"
                defaultValue={videoName}
                placeholder={t("video_tasks.filters.video_name_placeholder")}
                className="w-48"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>{t("video_tasks.filters.start_date")}</span>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={startDate}
                className="w-36"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>{t("video_tasks.filters.end_date")}</span>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={endDate}
                className="w-36"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>{t("video_tasks.filters.render_status")}</span>
              <select
                id="renderStatus"
                name="render_status"
                defaultValue={renderStatus ?? ""}
                className="h-9 w-36 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">
                  {t("video_tasks.filters.all_statuses")}
                </option>
                <option value="initialized">
                  {t("video_tasks.status.initialized")}
                </option>
                <option value="pending">
                  {t("video_tasks.status.pending")}
                </option>
                <option value="processing">
                  {t("video_tasks.status.processing")}
                </option>
                <option value="completed">
                  {t("video_tasks.status.completed")}
                </option>
                <option value="failed">{t("video_tasks.status.failed")}</option>
              </select>
            </label>
            <Button type="submit" variant="outline" className="self-end">
              {t("actions.search")}
            </Button>
          </form>
          {(draftId || videoName || startDate || endDate || renderStatus) && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="self-end text-muted-foreground hover:text-foreground"
            >
              <Link href="/video-tasks">{t("actions.clear_filters")}</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 border rounded-md overflow-hidden">
        <div className="h-full w-full overflow-auto">
          <Table className="min-w-max">
            <TableHeader className="sticky top-0 bg-background z-10 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-border">
              <TableRow>
                <TableHead className="bg-background">
                  {t("video_tasks.fields.id")}
                </TableHead>
                <TableHead className="bg-background">
                  {t("video_tasks.fields.task_id")}
                </TableHead>
                <TableHead className="bg-background">
                  {t("video_tasks.fields.draft_id")}
                </TableHead>
                <TableHead className="bg-background">
                  {t("video_tasks.fields.video_name")}
                </TableHead>
                <TableHead className="bg-background">
                  {t("video_tasks.fields.status")}
                </TableHead>
                <TableHead>{t("video_tasks.fields.message")}</TableHead>
                <TableHead>{t("video_tasks.fields.oss_url")}</TableHead>
                <TableHead className="bg-background">
                  {t("video_tasks.fields.created")}
                </TableHead>
                <TableHead className="bg-background">
                  {t("video_tasks.fields.updated")}
                </TableHead>
                <TableHead className="bg-background">
                  {t("video_tasks.fields.operations")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.id}</TableCell>
                  <TableCell className="font-mono">{task.taskId}</TableCell>
                  <TableCell className="font-mono">{task.draftId}</TableCell>
                  <TableCell
                    className="max-w-[24rem] truncate"
                    title={task.videoName ?? undefined}
                  >
                    {task.videoName ?? "-"}
                  </TableCell>
                  <TableCell>
                    {task.renderStatus
                      ? t(`video_tasks.status.${task.renderStatus}`)
                      : "-"}
                  </TableCell>
                  <TableCell
                    className="max-w-[24rem] truncate"
                    title={task.message ?? undefined}
                  >
                    {task.message ?? "-"}
                  </TableCell>
                  <TableCell>
                    {task.ossUrl ? (
                      <Link
                        href={task.ossUrl}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                      >
                        {t("actions.open")}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {task.updatedAt
                      ? new Date(task.updatedAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <RegenerateVideoDialog
                        taskId={task.taskId}
                        renderStatus={task.renderStatus}
                        buttonLabel={t("actions.regenerate")}
                      />
                      <ArchiveDraftDialog
                        d={{
                          id: task.id,
                          draftId: task.draftId,
                          videoName: task.videoName,
                        }}
                        buttonLabel={t("actions.archive_draft")}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} · {total} total
        </div>
        <div className="flex items-center gap-2">
          <form action="" className="flex items-center gap-2">
            <Input
              name="pageSize"
              defaultValue={String(pageSize)}
              className="w-24"
            />
            <Button type="submit" variant="outline">
              {t("actions.set_page_size")}
            </Button>
          </form>
          <Button asChild variant="outline" disabled={page <= 1}>
            <Link
              href={{
                pathname: "/video-tasks",
                query: {
                  page: String(prevPage),
                  pageSize: String(pageSize),
                  ...(draftId && { search: draftId }),
                  ...(videoName && { video_name: videoName }),
                  ...(startDate && { startDate }),
                  ...(endDate && { endDate }),
                  ...(renderStatus && { render_status: renderStatus }),
                },
              }}
            >
              {t("pagination.prev")}
            </Link>
          </Button>
          <Button asChild variant="outline" disabled={page >= totalPages}>
            <Link
              href={{
                pathname: "/video-tasks",
                query: {
                  page: String(nextPage),
                  pageSize: String(pageSize),
                  ...(draftId && { search: draftId }),
                  ...(videoName && { video_name: videoName }),
                  ...(startDate && { startDate }),
                  ...(endDate && { endDate }),
                  ...(renderStatus && { render_status: renderStatus }),
                },
              }}
            >
              {t("pagination.next")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
