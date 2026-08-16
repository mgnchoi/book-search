import type { SearchResponse } from './types';

const BASE_URL = 'https://openlibrary.org/search.json';
const MAX_TITLES = 10;
const TIMEOUT = 15000;

interface OpenLibrarySearchResponse {
  numFound: number,
  docs: { title?: string }[]
}

export async function searchOpenLibrary(searchTerm: string): Promise<SearchResponse> {
  // construct url
  // use fields and limit to pre-filter returned data
  const url = `${BASE_URL}?q=${encodeURIComponent(searchTerm)}&fields=title&limit=${MAX_TITLES}`;

  // make request to open library api
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });

  // throw error if fetch fails, router will handle
  if (!response.ok) {
    throw new Error(`Open Library responsed with ${response.status}`);
  }

  // parse response data
  const data = await response.json() as OpenLibrarySearchResponse;

  // extract target fields
  const resultCount = data.numFound;

  // dont include empty/missing titles
  const titles = data.docs
    .map(book => book.title ?? '')
    .filter(title => title !== '');

  return { resultCount, titles };
}
