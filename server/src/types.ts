export interface SavedSearch {
  username: string;
  searchTerm: string;
  resultCount: number;
}

export interface SearchRequestBody {
  username?: string;
  searchTerm?: string;
}

export interface SearchResponse {
  resultCount: number;
  titles: string[];
}

export type SortKey = 'searchTerm' | 'count';
export type SortOrder = 'asc' | 'desc';

// dictionary for column sorting on db
export const SORT_COLUMNS: Record<SortKey, string> = {
  searchTerm: 'search_term COLLATE NOCASE',
  count: 'result_count'
};