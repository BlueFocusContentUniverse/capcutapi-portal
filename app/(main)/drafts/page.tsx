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

import { generateVideo } from "./actions";

type SearchParams = Promise<{ page?: string; pageSize?: string }>;

export default async function DraftsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { t } = await serverTranslation("translation");
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page ?? 1));
  const pageSize = Math.max(1, Math.min(100, Number(params?.pageSize ?? 50)));

  const { items, total } = await getDraftsPaginated(page, pageSize);
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
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("drafts.title")}</h1>
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
              <TableCell>{d.version ?? "-"}</TableCell>
              <TableCell>{formatBytes(d.sizeBytes)}</TableCell>
              <TableCell>
                {d.createdAt ? new Date(d.createdAt).toLocaleString() : "-"}
              </TableCell>
              <TableCell>
                {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : "-"}
              </TableCell>
              <TableCell>
                {d.accessedAt ? new Date(d.accessedAt).toLocaleString() : "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {/* <Button variant="outline" size="sm">
                    {t("actions.delete")}
                  </Button> */}
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} · {total} total
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" disabled={page <= 1}>
            <Link
              href={{
                pathname: "/drafts",
                query: { page: String(prevPage), pageSize: String(pageSize) },
              }}
            >
              {t("pagination.prev")}
            </Link>
          </Button>
          <Button asChild variant="outline" disabled={page >= totalPages}>
            <Link
              href={{
                pathname: "/drafts",
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
