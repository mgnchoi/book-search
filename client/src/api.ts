import type { PreviousSearch, SearchResponse, SortKey, SortOrder } from './types';

// GET 
// /api/searches?username=...&sortKey=...&sortOrder=...
export async function getPreviousSearches(username: string, sortKey: SortKey, sortOrder: SortOrder): Promise<PreviousSearch[]> {
  // build query string
  const params = new URLSearchParams({ username, sortKey, sortOrder });
  const response = await fetch(`/api/searches?${params}`);

  if (!response.ok) {
    const { error } = await response.json();
    // in case response doesnt have error key
    throw new Error(error ?? 'Something went wrong');
  }

  const data = await response.json();
  return data.previousSearches;
}

// POST 
// /api/searches
export async function search(username: string, searchTerm: string): Promise<SearchResponse> {
  const response = await fetch('/api/searches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, searchTerm })
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error ?? 'Something went wrong');
  }

  const data: SearchResponse = await response.json();
  return data;
}