import { useState } from 'react';
import { ShotMap } from './components/ShotMap';
import { SearchBar } from './components/SearchBar';
import { useShotSearch } from './hooks/useShotSearch';
import type { SearchFilters } from './types';
import { Filter, BarChart3 } from 'lucide-react';

function App() {
  const { shots, isLoading, isIndexing, error, search } = useShotSearch();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ year: 'all', made: 'all' });

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    search(newQuery, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    search(query, newFilters);
  };

  // Calculate stats
  const totalShots = shots.length;
  const madeShots = shots.filter(s => s.made).length;
  const fgPct = totalShots > 0 ? ((madeShots / totalShots) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-nba-blue text-white p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span className="bg-nba-red p-1 rounded">NBA</span> Shot Search
          </h1>
          <a href="https://github.com" className="text-sm hover:underline text-gray-200">
            View on GitHub
        </a>
      </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-xl mb-4">Natural Language Shot Search (2021-2024)</h2>
          <SearchBar onSearch={handleSearch} />
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
              <Filter size={16} />
              <select 
                className="bg-transparent outline-none"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="all">All Seasons</option>
                <option value={2021}>2020-21</option>
                <option value={2022}>2021-22</option>
                <option value={2023}>2022-23</option>
                <option value={2024}>2023-24</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
              <span className="font-medium">Outcome:</span>
              <select 
                className="bg-transparent outline-none"
                value={String(filters.made)}
                onChange={(e) => {
                  const val = e.target.value;
                  handleFilterChange('made', val === 'all' ? 'all' : val === 'true');
                }}
              >
                <option value="all">All Shots</option>
                <option value="true">Made</option>
                <option value="false">Missed</option>
              </select>
            </div>
          </div>
        </div>

        {(isLoading || isIndexing) && (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nba-blue mx-auto mb-4"></div>
                <p>Loading Shot Data & Building Index...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a moment (approx 200MB data)</p>
            </div>
        )}

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        )}

        {!isLoading && !isIndexing && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ShotMap shots={shots} />
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                   <BarChart3 size={20} /> Stats
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                   <div>
                     <div className="text-2xl font-bold">{totalShots}</div>
                     <div className="text-xs text-gray-500 uppercase">Shots</div>
                   </div>
                   <div>
                     <div className="text-2xl font-bold text-green-600">{madeShots}</div>
                     <div className="text-xs text-gray-500 uppercase">Made</div>
                   </div>
                   <div>
                     <div className="text-2xl font-bold">{fgPct}%</div>
                     <div className="text-xs text-gray-500 uppercase">FG%</div>
                   </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg max-h-[500px] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Recent Results</h3>
                <div className="space-y-2">
                  {shots.slice(0, 50).map((shot) => (
                    <div key={shot.id} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                      <div className="font-medium">{shot.player}</div>
                      <div className="text-gray-500 flex justify-between">
                        <span>{shot.team} vs {shot.date}</span>
                        <span className={shot.made ? "text-green-600" : "text-red-600"}>
                          {shot.made ? "Made" : "Missed"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">{shot.search_text}</div>
                    </div>
                  ))}
                  {shots.length > 50 && (
                    <div className="text-center text-gray-400 text-xs pt-2">
                      ... and {shots.length - 50} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
  );
}

export default App;
