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

type SearchParams = Promise<{ page?: string; pageSize?: string }>;

export default async function VideoTasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { t } = await serverTranslation("translation");
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page ?? 1));
  const pageSize = Math.max(1, Math.min(100, Number(params?.pageSize ?? 50)));

  const { items, total } = await getVideoTasksPaginated(page, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("video_tasks.title")}</h1>
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
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("video_tasks.fields.id")}</TableHead>
            <TableHead>{t("video_tasks.fields.task_id")}</TableHead>
            <TableHead>{t("video_tasks.fields.draft_id")}</TableHead>
            <TableHead>{t("video_tasks.fields.video_name")}</TableHead>
            <TableHead>{t("video_tasks.fields.status")}</TableHead>
            {/* <TableHead>{t("video_tasks.fields.message")}</TableHead> */}
            {/* <TableHead>{t("video_tasks.fields.draft_url")}</TableHead> */}
            <TableHead>{t("video_tasks.fields.created")}</TableHead>
            <TableHead>{t("video_tasks.fields.updated")}</TableHead>
            <TableHead>{t("video_tasks.fields.operations")}</TableHead>
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
              <TableCell>{task.status}</TableCell>
              {/* <TableCell
                className="max-w-[24rem] truncate"
                title={task.message ?? undefined}
              >
                {task.message ?? "-"}
              </TableCell>
              <TableCell>
                {task.draftUrl ? (
                  <Link
                    href={task.draftUrl}
                    className="text-blue-600 hover:underline"
                    target="_blank"
                  >
                    {t("actions.open")}
                  </Link>
                ) : (
                  "-"
                )}
              </TableCell> */}
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} · {total} total
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" disabled={page <= 1}>
            <Link
              href={{
                pathname: "/video-tasks",
                query: { page: String(prevPage), pageSize: String(pageSize) },
              }}
            >
              {t("pagination.prev")}
            </Link>
          </Button>
          <Button asChild variant="outline" disabled={page >= totalPages}>
            <Link
              href={{
                pathname: "/video-tasks",
                query: { page: String(nextPage), pageSize: String(pageSize) },
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
