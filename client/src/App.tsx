import { useState } from "react";
import { getPreviousSearches, search } from "./api";
import { PreviousSearch, SearchResponse, SortKey, SortOrder } from "./types";
import SearchResults from "./components/SearchResults";
import PreviousSearches from "./components/PreviousSearches";

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

    // validate input and display error if fields are not populated
    if (!username.trim() || !searchTerm.trim()) {
      setError('Username and search term are required');
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
    // validate input and display error if username is not populated
    if (!username.trim()) {
      setError('Username is required');
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

  return (
    <div className="m-3">
      <h2>Search for books using the Open Library Search API</h2>
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
        <button type="submit" className="btn btn-primary" disabled={searching || gettingPrevious}>
          {searching ? 'Searching...' : 'Search'}
        </button>
        <button type="button" className="btn btn-primary mx-3" disabled={searching || gettingPrevious} onClick={handleClear}>Clear</button>
        <button type="button" className="btn btn-primary" disabled={searching || gettingPrevious} onClick={handleListPrevious}>
          {gettingPrevious ? 'Loading...' : 'List Previous'}
        </button>
      </form>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {searchResult && <SearchResults searchedTerm={searchedTerm} result={searchResult} />}
      {previousSearches && <PreviousSearches user={username} searches={previousSearches} sortKey={sortKey} sortOrder={sortOrder} onSortChange={handleSortChange} />}
    </div >
  );
}
