import { Router } from 'express';
import type Database from 'better-sqlite3';
import { searchOpenLibrary } from './openlibrary';
import { getPreviousSearches, insertSearch } from './db';
import { SearchResponse, SORT_COLUMNS, type SearchRequestBody, type SortKey, type SortOrder } from './types';

const DEFAULT_SORT_KEY: SortKey = 'searchTerm';
const DEFAULT_SORT_ORDER: SortOrder = 'asc';
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
const SEARCH_TERM_REGEX = /^[a-zA-Z0-9\s'\-:,.&()]+$/;
const INVALID_USERNAME_MSG = 'Username can only contain letters, numbers, underscores, periods, and hyphens';

export function createRoutes(db: Database.Database): Router {
  const router = Router();

  // GET
  // get sorted previous searches for a user
  router.get('/searches', (req, res) => {
    const { username, sortKey, sortOrder } = req.query;

    // trim and validate username
    const trimmedUsername = typeof username === 'string' ? username.trim() : undefined;
    // required field
    if (!trimmedUsername) return res.status(400).json({ error: 'Missing required fields' });
    // length
    if (trimmedUsername.length < 3 || trimmedUsername.length > 25) return res.status(400).json({ error: 'Username must be 3-25 characters' });
    // special chars
    if (!USERNAME_REGEX.test(trimmedUsername)) return res.status(400).json({ error: INVALID_USERNAME_MSG });

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
      const previousSearches = getPreviousSearches(db, trimmedUsername, validSortKey, validSortOrder);
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

    // required fields
    if (!trimmedUsername || !trimmedSearchTerm) return res.status(400).json({ error: 'Missing required fields' })
    // length
    if (trimmedUsername.length < 3 || trimmedUsername.length > 25) return res.status(400).json({ error: 'Username must be 3-25 characters' });
    if (trimmedSearchTerm.length < 3 || trimmedSearchTerm.length > 100) return res.status(400).json({ error: 'Search term must be 3-100 characters' });
    // special chars
    if (!USERNAME_REGEX.test(trimmedUsername)) return res.status(400).json({ error: INVALID_USERNAME_MSG });
    if (!SEARCH_TERM_REGEX.test(trimmedSearchTerm)) return res.status(400).json({ error: `Search term can only contain letters, numbers, spaces, and ' - : , & ( )` });

    let result: SearchResponse;

    try {
      // query Open Library with search term
      result = await searchOpenLibrary(trimmedSearchTerm);
    } catch (error) {
      console.error('Request to Open Library failed: ', error);
      // return failure
      return res.status(502).json({ error: 'Could not reach Open Library' });
    }

    try {
      // save search to db
      insertSearch(db, trimmedUsername, trimmedSearchTerm, result.resultCount);
    } catch (error) {
      console.error('Saving search failed: ', error);
      // return failure
      return res.status(500).json({ error: 'Error saving search results' });
    }

    // return success
    return res.status(201).json(result);
  });

  return router;
}
