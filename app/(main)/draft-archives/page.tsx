"use client";

import { Download, Search, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { nextApi } from "@/lib/service";
import type { Archive, ArchiveListResponse } from "@/types/archive";

export default function DraftArchivesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total_count: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });

  // Filters
  const [draftIdFilter, setDraftIdFilter] = useState(
    searchParams.get("draft_id") || "",
  );
  const [userIdFilter, setUserIdFilter] = useState(
    searchParams.get("user_id") || "",
  );
  const currentPage = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("page_size") || "50");

  // Fetch archives data
  const fetchArchives = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (draftIdFilter) params.set("draft_id", draftIdFilter);
      if (userIdFilter) params.set("user_id", userIdFilter);
      params.set("page", currentPage.toString());
      params.set("page_size", pageSize.toString());

      const response = await nextApi.get(
        `draft_archives/list?${params.toString()}`,
      );
      const data = response.json() as Promise<ArchiveListResponse>;
      const result = await data;

      if (result.success) {
        setArchives(result.output.archives);
        setPagination(result.output.pagination);
      } else {
        setError(result.error || "Failed to fetch archives");
      }
    } catch (err) {
      console.error("Error fetching archives:", err);
      setError("Failed to fetch archives");
    } finally {
      setLoading(false);
    }
  };

  // Update URL with filters
  const updateFilters = (filters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (filters.draft_id !== undefined || filters.user_id !== undefined) {
      params.set("page", "1");
    }

    router.push(`/draft-archives?${params.toString()}`);
  };

  // Handle search
  const handleSearch = () => {
    updateFilters({
      draft_id: draftIdFilter,
      user_id: userIdFilter,
    });
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage.toString() });
  };

  // Handle delete
  const handleDelete = async (archiveId: string) => {
    if (
      !confirm(
        t("draft_archives.delete_confirm", {
          archive_id: archiveId.slice(0, 8),
        }),
      )
    ) {
      return;
    }

    try {
      const response = await nextApi.delete(
        `draft_archives/delete/${archiveId}`,
      );
      const data = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (data.success) {
        toast.success(t("draft_archives.delete_success"));
        // Refresh the list
        fetchArchives();
      } else {
        toast.error(data.error || t("draft_archives.delete_error"));
      }
    } catch (err) {
      console.error("Error deleting archive:", err);
      toast.error(t("draft_archives.delete_error"));
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (archive: Archive) => {
    if (archive.download_url) {
      return (
        <Badge variant="default">{t("draft_archives.status.completed")}</Badge>
      );
    } else if (archive.progress !== null && archive.progress > 0) {
      return (
        <Badge variant="secondary">
          {t("draft_archives.status.in_progress")}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">{t("draft_archives.status.pending")}</Badge>
      );
    }
  };

  // Load data on mount and when search params change
  useEffect(() => {
    fetchArchives();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">{t("draft_archives.loading")}</div>
          <div className="text-sm text-muted-foreground">
            {t("draft_archives.please_wait")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("draft_archives.title")}</h1>
        <Button onClick={fetchArchives} variant="outline">
          {t("draft_archives.refresh")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Input
            placeholder={t("draft_archives.filters.draft_id_placeholder")}
            value={draftIdFilter}
            onChange={(e) => setDraftIdFilter(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder={t("draft_archives.filters.user_id_placeholder")}
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            {t("actions.search")}
          </Button>
        </div>

        {(draftIdFilter || userIdFilter) && (
          <Button
            onClick={() => {
              setDraftIdFilter("");
              setUserIdFilter("");
              updateFilters({ draft_id: "", user_id: "" });
            }}
            variant="ghost"
            size="sm"
          >
            {t("draft_archives.clear_filters")}
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="text-destructive font-medium">
            {t("draft_archives.error")}
          </div>
          <div className="text-sm text-destructive/80">{error}</div>
        </div>
      )}

      {/* Table Container with Scrolling */}
      <div className="flex-1 border rounded-lg overflow-hidden">
        <div className="h-full w-full overflow-x-auto overflow-y-auto">
          <Table className="min-w-max">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[120px]">
                  {t("draft_archives.table.archive_id")}
                </TableHead>
                <TableHead className="w-[120px]">
                  {t("draft_archives.table.draft_id")}
                </TableHead>
                <TableHead className="w-[150px]">
                  {t("draft_archives.table.archive_name")}
                </TableHead>
                <TableHead className="w-[80px]">
                  {t("draft_archives.table.version")}
                </TableHead>
                <TableHead className="w-[150px]">
                  {t("draft_archives.table.user_name")}
                </TableHead>
                <TableHead className="w-[100px]">
                  {t("draft_archives.table.status")}
                </TableHead>
                <TableHead className="w-[120px]">
                  {t("draft_archives.table.progress")}
                </TableHead>
                <TableHead className="w-[100px]">
                  {t("draft_archives.table.files")}
                </TableHead>
                <TableHead className="w-[200px]">
                  {t("draft_archives.table.message")}
                </TableHead>
                <TableHead className="w-[150px]">
                  {t("draft_archives.table.created")}
                </TableHead>
                <TableHead className="w-[150px]">
                  {t("draft_archives.table.updated")}
                </TableHead>
                <TableHead className="w-[120px]">
                  {t("draft_archives.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {draftIdFilter || userIdFilter
                        ? t("draft_archives.no_archives_filtered")
                        : t("draft_archives.no_archives")}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                archives.map((archive) => (
                  <TableRow key={archive.archive_id}>
                    <TableCell className="font-mono text-xs">
                      {archive.archive_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {archive.draft_id}
                    </TableCell>
                    <TableCell>{archive.archive_name || "-"}</TableCell>
                    <TableCell>
                      {archive.draft_version ||
                        t("draft_archives.version_current")}
                    </TableCell>
                    <TableCell>{archive.user_name || "-"}</TableCell>
                    <TableCell>{getStatusBadge(archive)}</TableCell>
                    <TableCell>
                      {archive.progress !== null ? (
                        <div className="space-y-1">
                          <Progress value={archive.progress} className="w-16" />
                          <div className="text-xs text-muted-foreground">
                            {archive.progress.toFixed(1)}%
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {archive.total_files !== null ? (
                        <div className="text-sm">
                          {archive.downloaded_files || 0} /{" "}
                          {archive.total_files}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {archive.message || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatTimestamp(archive.created_at)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatTimestamp(archive.updated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {archive.download_url ? (
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={archive.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={t("draft_archives.download")}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(archive.archive_id)}
                          title={t("draft_archives.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground">
          {t("draft_archives.pagination.page_info", {
            page: pagination.page,
            totalPages: pagination.total_pages,
            totalCount: pagination.total_count,
          })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.has_prev}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            {t("pagination.prev")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.has_next}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            {t("pagination.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
