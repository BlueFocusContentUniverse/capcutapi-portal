import { Video } from "lucide-react";
import Link from "next/link";

import GenerateVideoDialog from "@/components/generate-video-dialog";
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
import { getDraftsPaginated } from "@/drizzle/queries";
import { serverTranslation } from "@/lib/i18n/server";

type SearchParams = Promise<{
  page?: string;
  pageSize?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}>;

export default async function DraftsPage({
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

  const { items, total } = await getDraftsPaginated(
    page,
    pageSize,
    search,
    startDate,
    endDate,
  );
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const formatBytes = (bytes: number | null) => {
    if (!bytes || bytes <= 0) return "-";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div className="h-full flex flex-col space-y-4">
      <h1 className="text-xl font-semibold">{t("drafts.title")}</h1>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <form action="" className="flex items-center gap-2">
            <Input
              name="search"
              defaultValue={search}
              placeholder={t("drafts.placeholders.search_placeholder")}
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

      <div className="flex-1 border rounded-md overflow-hidden">
        <div className="h-full w-full overflow-auto">
          <Table className="min-w-max">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>{t("drafts.fields.id")}</TableHead>
                <TableHead>{t("drafts.fields.draft_id")}</TableHead>
                <TableHead>{t("drafts.fields.draft_name")}</TableHead>
                <TableHead>{t("drafts.fields.resource")}</TableHead>
                <TableHead>{t("drafts.fields.resolution")}</TableHead>
                <TableHead>{t("drafts.fields.duration")}</TableHead>
                <TableHead>{t("drafts.fields.fps")}</TableHead>
                <TableHead>{t("drafts.fields.version")}</TableHead>
                <TableHead>{t("drafts.fields.size")}</TableHead>
                <TableHead>{t("drafts.fields.created")}</TableHead>
                <TableHead>{t("drafts.fields.updated")}</TableHead>
                <TableHead>{t("drafts.fields.accessed")}</TableHead>
                <TableHead>{t("drafts.fields.operations")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell className="font-mono">{d.draftId}</TableCell>
                  <TableCell>{d.draftName ?? "-"}</TableCell>
                  <TableCell>{d.resource ?? "-"}</TableCell>
                  <TableCell>
                    {d.width ?? "-"}×{d.height ?? "-"}
                  </TableCell>
                  <TableCell>
                    {d.duration ? (d.duration / 1000000).toFixed(2) + "s" : "-"}
                  </TableCell>
                  <TableCell>{d.fps ?? "-"}</TableCell>
                  <TableCell>{d.currentVersion ?? "-"}</TableCell>
                  <TableCell>{formatBytes(d.sizeBytes)}</TableCell>
                  <TableCell>
                    {d.createdAt ? new Date(d.createdAt).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    {d.accessedAt
                      ? new Date(d.accessedAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/drafts/${d.draftId}/editor`}>
                          <Video className="mr-1 h-4 w-4" />
                          Editor
                        </Link>
                      </Button>
                      <GenerateVideoDialog
                        d={d}
                        buttonLabel={t("actions.generate_video")}
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
                pathname: "/drafts",
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
                pathname: "/drafts",
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
