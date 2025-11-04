import Link from "next/link";

import ArchiveDraftDialog from "@/components/archive-draft-dialog";
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
import { getVideoTasksPaginated } from "@/drizzle/queries";
import { serverTranslation } from "@/lib/i18n/server";

type SearchParams = Promise<{
  page?: string;
  pageSize?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
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
  const search = params?.search;
  const startDate = params?.startDate;
  const endDate = params?.endDate;

  const { items, total } = await getVideoTasksPaginated(
    page,
    pageSize,
    search,
    startDate,
    endDate,
  );
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t("video_tasks.title")}</h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <form action="" className="flex items-center gap-2">
            <Input
              name="search"
              defaultValue={search}
              placeholder={t("video_tasks.search_placeholder")}
              className="w-48"
            />
            <Input
              name="startDate"
              type="date"
              defaultValue={startDate}
              className="w-36"
            />
            <Input
              name="endDate"
              type="date"
              defaultValue={endDate}
              className="w-36"
            />
            <Button type="submit" variant="outline">
              {t("actions.search")}
            </Button>
          </form>
        </div>
      </div>

      <div className="border rounded-md max-h-[calc(100vh-16rem)] overflow-auto">
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
                <TableCell>{task.renderStatus}</TableCell>
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
                  <ArchiveDraftDialog
                    d={{ id: task.id, draftId: task.draftId }}
                    buttonLabel={t("actions.archive_draft")}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                  ...(search && { search }),
                  ...(startDate && { startDate }),
                  ...(endDate && { endDate }),
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
                  ...(search && { search }),
                  ...(startDate && { startDate }),
                  ...(endDate && { endDate }),
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
