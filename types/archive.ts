export interface Archive {
  archive_id: string;
  draft_id: string;
  draft_version: number | null;
  user_id: string | null;
  user_name: string | null;
  download_url: string | null;
  total_files: number | null;
  progress: number | null;
  downloaded_files: number | null;
  message: string | null;
  created_at: number;
  updated_at: number;
}

export interface ArchivePagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ArchiveListResponse {
  success: boolean;
  output: {
    archives: Archive[];
    pagination: ArchivePagination;
  };
  error: string;
}

export interface ArchiveFilters {
  draft_id?: string;
  user_id?: string;
  page?: number;
  page_size?: number;
}
