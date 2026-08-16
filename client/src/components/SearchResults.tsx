import type { SearchResponse } from '../types';

interface SearchResultsProps {
  searchedTerm: string,
  result: SearchResponse;
}

export default function SearchResults({ searchedTerm, result }: SearchResultsProps) {
  // early return for 0 results
  if (result.resultCount === 0) {
    return (
      <div className="mx-3">
        <h4>0 results found for "{searchedTerm}"</h4>
      </div>
    );
  }
  // display results in table with only title column
  return (
    <div className="mx-3">
      <h4>{result.resultCount} results found for "{searchedTerm}"</h4>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Title</th>
          </tr>
        </thead>
        <tbody>
          {result.titles.map((title, index) => {
            return (
              <tr key={index}>
                <td>{title}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="text-center">
        <p>{result.titles.length} out of {result.resultCount} results</p>
      </div>
    </div>
  );
}
