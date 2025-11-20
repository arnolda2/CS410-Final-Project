import { useState, useEffect, useRef, useCallback } from 'react';
import MiniSearch from 'minisearch';
import type { Shot, SearchFilters, ZoneStats } from '../types';

const DATA_URL = import.meta.env.BASE_URL + 'shots_index.json.gz';

export function useShotSearch() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIndexing, setIsIndexing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uniquePlayers, setUniquePlayers] = useState<string[]>([]);
  
  // Stats
  const [zoneStats, setZoneStats] = useState<ZoneStats[]>([]);
  
  // Keep reference to search engine and data
  const miniSearchRef = useRef<MiniSearch<Shot> | null>(null);
  const allShotsRef = useRef<Shot[]>([]);
  const leagueZoneStatsRef = useRef<Map<string, { made: number; total: number }>>(new Map());

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error(`Failed to load shot data from ${DATA_URL}`);
        
        let data: Shot[];
        
        try {
             const ds = new DecompressionStream('gzip');
             const decompressedStream = response.body?.pipeThrough(ds);
             if (!decompressedStream) throw new Error('Stream is empty');
             data = await new Response(decompressedStream).json();
        } catch (e) {
            console.warn("Decompression failed or not needed, trying plain JSON", e);
            const clone = response.clone();
            data = await clone.json();
        }
        
        // Sort by date descending (newest first) by default
        data.sort((a, b) => b.date.localeCompare(a.date));

        allShotsRef.current = data;
        
        // Calculate League Stats per Zone
        const leagueStats = new Map<string, { made: number; total: number }>();
        data.forEach(shot => {
            if (!shot.zone) return;
            const current = leagueStats.get(shot.zone) || { made: 0, total: 0 };
            current.total++;
            if (shot.made) current.made++;
            leagueStats.set(shot.zone, current);
        });
        leagueZoneStatsRef.current = leagueStats;

        setShots(data.slice(0, 2000)); // Initial display
        
        // Calculate initial zone stats
        const initialZoneStats = computeZoneStats(data, leagueStats);
        setZoneStats(initialZoneStats);

        // Extract unique players
        const players = new Set(data.map(s => s.player));
        setUniquePlayers(Array.from(players).sort());

        setIsLoading(false);
        
        // Initialize search index in background
        setTimeout(() => {
            try {
                const miniSearch = new MiniSearch<Shot>({
                    fields: ['search_text'], // Fields to index
                    storeFields: ['id', 'player', 'team', 'x', 'y', 'made', 'year', 'date', 'dist', 'zone'], // Fields to return
                    searchOptions: {
                        boost: { player: 2, team: 1.5 },
                        prefix: true,
                        fuzzy: 0.2,
                        combineWith: 'AND'
                    }
                });
                
                miniSearch.addAll(data);
                miniSearchRef.current = miniSearch;
                setIsIndexing(false);
            } catch (err) {
                console.error("Indexing error:", err);
            }
        }, 100);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
        setIsIndexing(false);
      }
    }

    loadData();
  }, []);

  // Helper pure function to calculate stats
  const computeZoneStats = (currentShots: Shot[], leagueStats: Map<string, { made: number; total: number }>) => {
      const stats = new Map<string, { made: number; total: number }>();
      
      currentShots.forEach(shot => {
          if (!shot.zone) return;
          const current = stats.get(shot.zone) || { made: 0, total: 0 };
          current.total++;
          if (shot.made) current.made++;
          stats.set(shot.zone, current);
      });

      const result: ZoneStats[] = [];
      stats.forEach((val, zone) => {
          const league = leagueStats.get(zone);
          const leaguePct = league && league.total > 0 ? (league.made / league.total) * 100 : 0;
          
          result.push({
              zone,
              fgPct: (val.made / val.total) * 100,
              attempts: val.total,
              leagueFgPct: leaguePct
          });
      });

      // Sort by attempts descending
      result.sort((a, b) => b.attempts - a.attempts);
      return result;
  };

  const search = useCallback((query: string, filters: SearchFilters) => {
    let results: Shot[] = [];

    // If there is a query, use MiniSearch
    if (query && miniSearchRef.current) {
      // @ts-ignore - MiniSearch types
      const searchResults = miniSearchRef.current.search(query);
      results = searchResults.map(hit => hit as unknown as Shot);
    } else {
      results = allShotsRef.current;
    }

    // Apply filters
    results = results.filter(shot => {
      if (filters.year !== 'all' && shot.year !== filters.year) return false;
      if (filters.made !== 'all') {
         const isMade = filters.made === true ? 1 : 0;
         if (shot.made !== isMade) return false;
      }
      if (filters.player && shot.player !== filters.player) return false;
      
      // Distance filters
      if (filters.minDist !== undefined && shot.dist < filters.minDist) return false;
      if (filters.maxDist !== undefined && shot.dist > filters.maxDist) return false;

      return true;
    });

    // Calculate stats on FULL filtered set
    const newZoneStats = computeZoneStats(results, leagueZoneStatsRef.current);
    setZoneStats(newZoneStats);

    // Apply sorting
    if (filters.sortBy === 'date') {
        results.sort((a, b) => b.date.localeCompare(a.date));
    } else if (filters.sortBy === 'relevance' && !query) {
        // If relevance requested but no query, fallback to date
         results.sort((a, b) => b.date.localeCompare(a.date));
    }
    // Note: MiniSearch results are already sorted by relevanceScore if query exists, 
    // but we might have lost order during filtering? 
    // MiniSearch returns sorted hits. filter preserves order.
    // So if sortBy is relevance, we don't re-sort unless we want to force it.

    // Limit results for performance
    setShots(results.slice(0, 2000));
  }, []);

  // Helper to find players matching a prefix
  const suggestPlayers = useCallback((prefix: string): string[] => {
    if (!prefix || prefix.length < 2) return [];
    const lower = prefix.toLowerCase();
    return uniquePlayers.filter(p => p.toLowerCase().includes(lower)).slice(0, 10);
  }, [uniquePlayers]);

  return {
    shots,
    zoneStats,
    isLoading,
    isIndexing,
    error,
    search,
    suggestPlayers
  };
}
