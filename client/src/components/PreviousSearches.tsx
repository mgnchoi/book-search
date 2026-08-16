import { search } from '../api';
import type { PreviousSearch, SortKey, SortOrder } from '../types';

interface PreviousSearchesProps {
  user: string,
  searches: PreviousSearch[];
  sortKey: SortKey;
  sortOrder: SortOrder;
  onSortChange: (sortKey: SortKey, sortOrder: SortOrder) => void;
}

export default function PreviousSearches({
  user,
  searches,
  sortKey,
  sortOrder,
  onSortChange,
}: PreviousSearchesProps) {
  // early return if user has no previous searches
  if (searches.length === 0) {
    return (
      <div className="mx-3">
        <h4>No previous searches found for {user}</h4>
      </div>
    );
  }
  // display previous searches in table with sort control
  return (
    <div className="mx-3">
      <h4>Previous searches for {user}</h4>
      <div className="my-1 d-flex justify-content-end align-items-center gap-2">
        <label htmlFor="sort-select">Sort By: </label>
        <select
          id="sort-select"
          className="form-select form-select-sm w-auto"
          value={`${sortKey}-${sortOrder}`}
          onChange={e => {
            const [key, order] = e.target.value.split('-');
            onSortChange(key as SortKey, order as SortOrder);
          }}
        >
          <option value="searchTerm-asc">Search Term A-Z</option>
          <option value="searchTerm-desc">Search Term Z-A</option>
          <option value="count-asc">Count Ascending</option>
          <option value="count-desc">Count Descending</option>
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Username</th>
            <th scope="col">Search Term</th>
            <th scope="col">Result Count</th>
          </tr>
        </thead>
        <tbody>
          {searches.map((search, index) => {
            return (
              <tr key={index}>
                <td>{search.username}</td>
                <td>{search.searchTerm}</td>
                <td>{search.resultCount}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="text-center">
        <p>{searches.length} {searches.length === 1 ? 'search' : 'searches'} found</p>
      </div>
    </div>
  );
}
