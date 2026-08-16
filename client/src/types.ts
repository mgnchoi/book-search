// return for GET /api/searches
export interface PreviousSearch {
  username: string;
  searchTerm: string;
  resultCount: number;
}

// return for POST /api/searches
export interface SearchResponse {
  resultCount: number;
  titles: string[];
}

export type SortKey = 'searchTerm' | 'count';
export type SortOrder = 'asc' | 'desc';
