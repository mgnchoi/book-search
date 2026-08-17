import Database from 'better-sqlite3';
import { SORT_COLUMNS, type SavedSearch, type SortKey, type SortOrder } from './types';
import path from 'path';

// open db, create table, and return connection
export function initDb(): Database.Database {
  const dbPath = path.resolve(__dirname, '../bookSearch.db');
  const db = new Database(dbPath);
  db.exec(
    `CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      search_term TEXT NOT NULL,
      result_count INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );`
  );
  return db;
}

// insert a new search
export function insertSearch(db: Database.Database, username: string, searchTerm: string, resultCount: number): void {
  const stmt = db.prepare(
    `INSERT INTO searches (username, search_term, result_count)
    VALUES (?, ?, ?)`
  )
  stmt.run(username, searchTerm, resultCount);
}

// get all previous searches by username 
export function getPreviousSearches(db: Database.Database, username: string, sortKey: SortKey, sortOrder: SortOrder): SavedSearch[] {
  const expression = SORT_COLUMNS[sortKey];
  const direction = sortOrder === 'asc' ? 'asc' : 'desc';

  const stmt = db.prepare(
    `SELECT 
      username,
      search_term AS searchTerm,
      result_count AS resultCount
    FROM searches
    WHERE username = ? COLLATE NOCASE
    ORDER BY ${expression} ${direction}`
  )
  return stmt.all(username) as SavedSearch[];
}