import { useState } from "react";
import { getPreviousSearches, search } from "./api";
import { PreviousSearch, SearchResponse, SortKey, SortOrder } from "./types";
import SearchResults from "./components/SearchResults";
import PreviousSearches from "./components/PreviousSearches";

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
const SEARCH_TERM_REGEX = /^[a-zA-Z0-9\s'\-:,.&()]+$/;
const INVALID_USERNAME_MSG = 'Username can only contain letters, numbers, underscores, periods, and hyphens';

export default function App() {
  // Input fields
  const [username, setUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedTerm, setSearchedTerm] = useState(''); // store term used for actual search

  // Sorting options
  const [sortKey, setSortKey] = useState<SortKey>('searchTerm');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Results
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [previousSearches, setPreviousSearches] = useState<PreviousSearch[] | null>(null);

  // Loading
  const [searching, setSearching] = useState(false);
  const [gettingPrevious, setGettingPrevious] = useState(false);

  // Errors
  const [error, setError] = useState('');

  // CLEAR BUTTON
  function handleClear() {
    setUsername('');
    setSearchTerm('');
    setSearchedTerm('');
    setSortKey('searchTerm');
    setSortOrder('asc');
    setSearchResult(null);
    setPreviousSearches(null);
    setError('');
    setSearching(false);
    setGettingPrevious(false);
  }

  // SEARCH BUTTON
  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    // prevent auto submit
    e.preventDefault();

    // validate input
    const trimmedUsername = username.trim();
    const trimmedSearchTerm = searchTerm.trim();
    // required fields
    if (!trimmedUsername || !trimmedSearchTerm) {
      setError('Username and search term are required');
      return;
    }

    // length
    if (trimmedUsername.length < 3 || trimmedSearchTerm.length < 3) {
      setError('Username and search term must be at least 3 characters');
      return;
    }
    if (trimmedUsername.length > 25) {
      setError('Username must be 25 characters or less');
      return;
    }
    if (trimmedSearchTerm.length > 100) {
      setError('Search term must be 100 characters or less');
      return;
    }

    // special chars
    if (!USERNAME_REGEX.test(trimmedUsername)) {
      setError(INVALID_USERNAME_MSG);
      return;
    }
    if (!SEARCH_TERM_REGEX.test(trimmedSearchTerm)) {
      setError(`Search term can only contain letters, numbers, spaces, and ' - : , & ( )`);
      return;
    }

    // clear currently displayed
    setSearchResult(null);
    setPreviousSearches(null);
    setSearching(true);
    setError('');

    // search
    try {
      const result = await search(username, searchTerm);
      setSearchResult(result);
      setSearchedTerm(searchTerm);  // save searched term for search results
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSearching(false);
    }
  }

  // Helper to load and set previous searches
  async function loadPreviousSearches(sortKey: SortKey, sortOrder: SortOrder) {
    setSearchResult(null);
    setGettingPrevious(true);
    setError('');

    try {
      const result = await getPreviousSearches(username, sortKey, sortOrder);
      setPreviousSearches(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setGettingPrevious(false);
    }
  }

  // LIST PREVIOUS BUTTON
  async function handleListPrevious() {
    // validate input
    // required field
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Username is required');
      return;
    }

    // length
    if (trimmedUsername.length < 3 || trimmedUsername.length > 25) {
      setError('Username must be 3-25 characters');
      return;
    }

    // special chars
    if (!USERNAME_REGEX.test(trimmedUsername)) {
      setError(INVALID_USERNAME_MSG);
      return;
    }

    await loadPreviousSearches(sortKey, sortOrder);
  }

  // Update previous searches table
  async function handleSortChange(sortKey: SortKey, sortOrder: SortOrder) {
    setSortKey(sortKey);
    setSortOrder(sortOrder);

    // sorting done on db so must make api call
    await loadPreviousSearches(sortKey, sortOrder);
  }

  // Helper to control disabled of CLEAR button
  function hasInputOrContent(): boolean {
    if (username !== '' || searchTerm !== '' || error !== '' || searchResult !== null || previousSearches !== null) {
      return true;
    }
    else {
      return false;
    }
  }

  return (
    <div className="container my-3">
      <h1>Book Search</h1>
      <p className="text-body-secondary">Search the Open Library Catalog and view your search history</p>
      <form onSubmit={handleSubmit} className="m-3">
        <div className="mb-3">
          <label className="form-label" htmlFor="username">Username</label>
          <span className="text-danger">*</span>
          <input type="text" className="form-control" id="username" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="searchTerm">Search Term</label>
          <span className="text-danger">*</span>
          <input type="text" className="form-control" id="searchTerm" placeholder="Enter a search term" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={searching || gettingPrevious}>
            {searching ? 'Searching...' : 'Search'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={searching || gettingPrevious || !hasInputOrContent()} onClick={handleClear}>Clear</button>
          <button type="button" className="btn btn-outline-primary ms-auto" disabled={searching || gettingPrevious} onClick={handleListPrevious}>
            {gettingPrevious ? 'Loading...' : 'List Previous'}
          </button>
        </div>
      </form>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!searching && !gettingPrevious && !searchResult && !previousSearches && (
        <p className="text-body-secondary">Enter a username and search term to get started</p>
      )}
      {searchResult && <SearchResults searchedTerm={searchedTerm} result={searchResult} />}
      {previousSearches && <PreviousSearches user={username} searches={previousSearches} sortKey={sortKey} sortOrder={sortOrder} onSortChange={handleSortChange} />}
    </div >
  );
}
