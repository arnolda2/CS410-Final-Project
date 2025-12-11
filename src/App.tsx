import { useState, useCallback, useRef, useEffect } from 'react';
import { ShotMap } from './components/ShotMap';
import { SearchBar } from './components/SearchBar';
import { ZoneChart } from './components/ZoneChart';
import { DistanceFilter } from './components/DistanceFilter';
import { InfoModal } from './components/InfoModal';
import { useShotSearch } from './hooks/useShotSearch';
import type { SearchFilters } from './types';
import { 
  Filter, 
  BarChart3, 
  List, 
  Map as MapIcon,
  Github,
  Info
} from 'lucide-react';

function App() {
  const { shots, zoneStats, searchStats, hasSearched, isLoading, isIndexing, error, search, suggestPlayers } = useShotSearch();
  
  const [filters, setFilters] = useState<SearchFilters>({ 
    year: 'all', 
    made: 'all', 
    player: null, 
    sortBy: 'date',
    minDist: undefined, 
    maxDist: undefined 
  });
  
  // Store last query to re-run search when filters update
  const [lastQuery, setLastQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'recent'>('stats');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Keep filters ref for stable callbacks
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Stable search handler for SearchBar
  const onSearch = useCallback((query: string) => {
    setLastQuery(query);
    const currentFilters = filtersRef.current;
    // We rely on text search now, so ensure strict player filter is cleared
    const newFilters = { ...currentFilters, player: null };
    
    if (currentFilters.player !== null) {
        setFilters(newFilters);
    }
    
    search(query, newFilters);
  }, [search]);

  const updateFilter = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    search(lastQuery, newFilters);
  };

  // Use stats from full result set (not sliced for display)
  const totalShots = searchStats.totalShots;
  const madeShots = searchStats.madeShots;
  const fgPct = searchStats.fgPct.toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-nba-blue text-white p-1.5 rounded font-bold tracking-tighter flex items-center justify-center h-8 w-8">
               NBA
             </div>
             <h1 className="text-xl font-bold tracking-tight">Shot Engine</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsInfoOpen(true)}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Info size={20} />
              <span className="hidden md:inline">How it works</span>
            </button>
            <div className="h-5 w-px bg-slate-800"></div>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="w-full lg:w-1/3">
              <SearchBar 
                onSearch={onSearch} 
                onQueryChange={suggestPlayers}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-center lg:justify-end">
               {/* Year */}
               <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <Filter size={14} className="text-slate-500" />
                  <select 
                    className="bg-transparent outline-none text-sm font-medium text-slate-700"
                    value={filters.year}
                    onChange={(e) => updateFilter({ year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
                  >
                    <option value="all">All Seasons</option>
                    <option value={2021}>2020-21</option>
                    <option value={2022}>2021-22</option>
                    <option value={2023}>2022-23</option>
                    <option value={2024}>2023-24</option>
                  </select>
               </div>

               {/* Outcome */}
               <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Res</span>
                  <select 
                    className="bg-transparent outline-none text-sm font-medium text-slate-700"
                    value={String(filters.made)}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateFilter({ made: val === 'all' ? 'all' : val === 'true' });
                    }}
                  >
                    <option value="all">All</option>
                    <option value="true">Made</option>
                    <option value="false">Missed</option>
                  </select>
               </div>

               {/* Distance */}
               <DistanceFilter 
                 onChange={(min, max) => updateFilter({ minDist: min, maxDist: max })}
               />

               {/* Sort */}
               <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Sort</span>
                  <select 
                    className="bg-transparent outline-none text-sm font-medium text-slate-700"
                    value={filters.sortBy || 'date'}
                    onChange={(e) => updateFilter({ sortBy: e.target.value as any })}
                  >
                    <option value="date">Newest</option>
                    <option value="relevance">Best Match</option>
                  </select>
               </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || isIndexing) && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nba-blue mb-4"></div>
                <p className="text-sm font-medium text-slate-600">Loading Shot Data...</p>
            </div>
        )}

        {/* Error State */}
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
            </div>
        )}

        {/* Main Dashboard */}
        {!isLoading && !isIndexing && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Map (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-1">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                      <MapIcon size={18} /> Shot Chart
                    </h2>
                    <span className="text-xs text-slate-400">
                      {hasSearched 
                        ? totalShots > 2000 
                          ? `Showing 2000 of ${totalShots.toLocaleString()} shots` 
                          : `Showing ${totalShots.toLocaleString()} shots`
                        : 'Search to see shots'}
                    </span>
                  </div>
                  <div className="relative bg-white min-h-[400px] md:min-h-[600px] flex items-center justify-center p-4">
                    {hasSearched ? (
                      <ShotMap shots={shots} />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <MapIcon size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Ready to explore NBA shots</h3>
                        <p className="text-sm text-slate-500 max-w-sm">
                          Search for a player, shot type, or zone above to visualize shots on the court.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">Stephen Curry corner 3</span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">LeBron James dunk</span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">Lillard 30ft</span>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Right Column: Analysis & Stats (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-slate-800">{hasSearched ? totalShots.toLocaleString() : '—'}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shots</div>
                 </div>
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-green-600">{hasSearched ? madeShots.toLocaleString() : '—'}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Made</div>
                 </div>
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="text-2xl font-bold text-nba-blue">{hasSearched ? `${fgPct}%` : '—'}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FG%</div>
                 </div>
              </div>

              {/* Tabbed Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
                <div className="flex border-b border-slate-100">
                   <button 
                     onClick={() => setActiveTab('stats')}
                     className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'stats' ? 'text-nba-blue border-b-2 border-nba-blue bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}
                   >
                     <BarChart3 size={16} /> Zone Analysis
                   </button>
                   <button 
                     onClick={() => setActiveTab('recent')}
                     className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'recent' ? 'text-nba-blue border-b-2 border-nba-blue bg-slate-50' : 'text-slate-500 hover:bg-slate-50'}`}
                   >
                     <List size={16} /> Recent Shots
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                   {activeTab === 'stats' ? (
                      <div className="space-y-6">
                        {hasSearched && zoneStats.length > 0 ? (
                          <>
                            <div>
                               <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Shooting by Zone</h3>
                               <ZoneChart stats={zoneStats} />
                            </div>
                            
                            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800 leading-relaxed">
                               <strong>Tip:</strong> Filter by a specific player to compare their efficiency against the league average in different zones.
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">{hasSearched ? 'No zone data for this search' : 'Search to see zone analysis'}</p>
                          </div>
                        )}
                      </div>
                   ) : (
                      <div className="space-y-2">
                        {hasSearched && shots.length > 0 ? (
                          <>
                            {shots.slice(0, 50).map((shot) => (
                              <div key={shot.id} className="text-sm border-b border-slate-100 pb-3 last:border-0">
                                <div className="flex justify-between items-start mb-1">
                                   <span className="font-semibold text-slate-700 truncate pr-2">{shot.player}</span>
                                   <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${shot.made ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                     {shot.made ? "MADE" : "MISS"}
                                   </span>
                                </div>
                                <div className="text-slate-500 text-xs flex justify-between">
                                  <span>{shot.dist}ft • {shot.zone}</span>
                                  <span>{shot.date}</span>
                                </div>
                                <div className="text-slate-400 text-[10px] mt-1 truncate">{shot.team}</div>
                              </div>
                            ))}
                            {totalShots > 50 && (
                              <div className="text-center text-slate-400 text-xs pt-2">
                                ... {totalShots - 50} more
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <List size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">{hasSearched ? 'No shots found' : 'Search to see recent shots'}</p>
                          </div>
                        )}
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
