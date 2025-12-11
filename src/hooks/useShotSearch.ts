import { useState, useEffect, useRef, useCallback } from 'react';
import MiniSearch from 'minisearch';
import type { Shot, SearchFilters, ZoneStats } from '../types';

const DATA_URL = import.meta.env.BASE_URL + 'shots_index.json.gz';

// Interface for search result statistics (before display limit is applied)
export interface SearchStats {
  totalShots: number;
  madeShots: number;
  fgPct: number;
}

export function useShotSearch() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [searchStats, setSearchStats] = useState<SearchStats>({ totalShots: 0, madeShots: 0, fgPct: 0 });
  const [hasSearched, setHasSearched] = useState(false); // Track if user has searched
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

        // Don't pre-populate shots - wait for user to search
        setShots([]);
        setZoneStats([]);
        setSearchStats({ totalShots: 0, madeShots: 0, fgPct: 0 });

        // Extract unique players
        const players = new Set(data.map(s => s.player));
        setUniquePlayers(Array.from(players).sort());

        setIsLoading(false);
        
        // Initialize search index in background
        setTimeout(() => {
            try {
                const miniSearch = new MiniSearch<Shot>({
                    fields: ['search_text', 'player'], // Index both search_text and player separately
                    storeFields: ['id', 'player', 'team', 'x', 'y', 'made', 'year', 'date', 'dist', 'zone'],
                    searchOptions: {
                        boost: { player: 3, search_text: 1 },
                        prefix: true,
                        fuzzy: false, // Disable fuzzy matching to prevent "Tatum" matching "Batum"
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

  // Helper to parse distance from query (e.g., "Lillard 30ft" -> { cleanQuery: "Lillard", minDist, maxDist })
  const parseDistanceFromQuery = (query: string): { cleanQuery: string; minDist?: number; maxDist?: number } => {
    // Match patterns like "30ft", "30 ft", "30-ft", "30 feet"
    const distancePattern = /(\d+)\s*(?:ft|feet)/gi;
    const matches = [...query.matchAll(distancePattern)];
    
    if (matches.length === 0) {
      return { cleanQuery: query };
    }
    
    // Extract distance value and create a range (±2 feet tolerance)
    const distance = parseInt(matches[0][1], 10);
    const tolerance = 2;
    
    // Remove the distance pattern from the query for text search
    const cleanQuery = query.replace(distancePattern, '').trim().replace(/\s+/g, ' ');
    
    return {
      cleanQuery,
      minDist: Math.max(0, distance - tolerance),
      maxDist: distance + tolerance
    };
  };

  const search = useCallback((query: string, filters: SearchFilters) => {
    setHasSearched(true);
    let results: Shot[] = [];

    // Parse distance from query if present
    const { cleanQuery, minDist: queryMinDist, maxDist: queryMaxDist } = parseDistanceFromQuery(query);
    
    // Merge query-parsed distance with explicit filter distance (explicit filters take precedence)
    const effectiveMinDist = filters.minDist !== undefined ? filters.minDist : queryMinDist;
    const effectiveMaxDist = filters.maxDist !== undefined ? filters.maxDist : queryMaxDist;

    // If there is a cleaned query, use MiniSearch
    if (cleanQuery && miniSearchRef.current) {
      // @ts-ignore - MiniSearch types
      const searchResults = miniSearchRef.current.search(cleanQuery);
      results = searchResults.map(hit => hit as unknown as Shot);
    } else if (!cleanQuery && (effectiveMinDist !== undefined || effectiveMaxDist !== undefined || filters.year !== 'all' || filters.made !== 'all')) {
      // If only filters are applied (no text query), use all shots as base
      results = allShotsRef.current;
    } else if (!cleanQuery) {
      // No query and no filters - show empty state
      setShots([]);
      setZoneStats([]);
      setSearchStats({ totalShots: 0, madeShots: 0, fgPct: 0 });
      return;
    }

    // Apply filters
    results = results.filter(shot => {
      if (filters.year !== 'all' && shot.year !== filters.year) return false;
      if (filters.made !== 'all') {
         const isMade = filters.made === true ? 1 : 0;
         if (shot.made !== isMade) return false;
      }
      if (filters.player && shot.player !== filters.player) return false;
      
      // Distance filters (combining query-parsed and explicit)
      if (effectiveMinDist !== undefined && shot.dist < effectiveMinDist) return false;
      if (effectiveMaxDist !== undefined && shot.dist > effectiveMaxDist) return false;

      return true;
    });

    // Calculate stats on FULL filtered set (before slicing for display)
    const totalShots = results.length;
    const madeShots = results.filter(s => s.made === 1).length;
    const fgPct = totalShots > 0 ? (madeShots / totalShots) * 100 : 0;
    setSearchStats({ totalShots, madeShots, fgPct });

    // Calculate zone stats on FULL filtered set
    const newZoneStats = computeZoneStats(results, leagueZoneStatsRef.current);
    setZoneStats(newZoneStats);

    // Apply sorting
    if (filters.sortBy === 'date') {
        results.sort((a, b) => b.date.localeCompare(a.date));
    } else if (filters.sortBy === 'relevance' && !cleanQuery) {
        // If relevance requested but no query, fallback to date
         results.sort((a, b) => b.date.localeCompare(a.date));
    }
    // Note: MiniSearch results are already sorted by relevanceScore if query exists

    // Limit results for display performance
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
    searchStats,
    hasSearched,
    isLoading,
    isIndexing,
    error,
    search,
    suggestPlayers
  };
}
