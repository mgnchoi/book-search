import { Router } from 'express';
import type Database from 'better-sqlite3';
import { searchOpenLibrary } from './openlibrary';
import { getSearches, insertSearch } from './db';
import { SORT_COLUMNS, type SearchRequestBody, type SortKey, type SortOrder } from './types';

const DEFAULT_SORT_KEY: SortKey = 'searchTerm';
const DEFAULT_SORT_ORDER: SortOrder = 'asc';

export function createRoutes(db: Database.Database): Router {
  const router = Router();

  // GET
  // get sorted previous searches for a user
  router.get('/searches', (req, res) => {
    const { username, sortKey, sortOrder } = req.query;

    // trim and validate username
    const trimmedUsername = typeof username === 'string' ? username.trim() : undefined;
    if (!trimmedUsername) return res.status(400).json({ error: 'Missing required fields' });

    // validate sort key and fallback to default
    let validSortKey: SortKey = DEFAULT_SORT_KEY;
    if (typeof sortKey === 'string' && sortKey in SORT_COLUMNS) validSortKey = sortKey as SortKey;
    else if (sortKey !== undefined) {
      return res.status(400).json({ error: 'Invalid sort key' });
    }

    // validate sort order and fallback to default
    let validSortOrder: SortOrder = DEFAULT_SORT_ORDER;
    if (typeof sortOrder === 'string' && (sortOrder === 'asc' || sortOrder === 'desc')) validSortOrder = sortOrder as SortOrder;
    else if (sortOrder !== undefined) {
      return res.status(400).json({ error: 'Invalid sort order' });
    }

    try {
      // get sorted searches from db
      const previousSearches = getSearches(db, trimmedUsername, validSortKey, validSortOrder);
      // return success
      return res.status(200).json({ previousSearches });
    } catch (error) {
      console.error('Getting previous searches failed: ', error);
      // return failure
      return res.status(500).json({ error: 'An unexpected error occurred while retrieving previous searches' })
    }
  });

  // POST
  // insert a new search
  router.post('/searches', async (req, res) => {
    // make req.body empty, not undefined if no body passed
    const { username, searchTerm } = (req.body ?? {}) as SearchRequestBody;

    // trim and validate inputs
    const trimmedUsername = username?.trim();
    const trimmedSearchTerm = searchTerm?.trim();

    if (!trimmedUsername || !trimmedSearchTerm) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // query Open Library with search term
      const result = await searchOpenLibrary(trimmedSearchTerm);
      // save search to db
      insertSearch(db, trimmedUsername, trimmedSearchTerm, result.resultCount);
      // return success
      return res.status(201).json(result);
    } catch (error) {
      console.error('Search or save failed: ', error);
      // return failure
      return res.status(500).json({ error: 'An unexpected error occurred while retrieving search results' });
    }
  });

  return router;
}
