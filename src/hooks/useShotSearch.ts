import { useState, useEffect, useRef } from 'react';
import MiniSearch from 'minisearch';
import { Shot, SearchFilters } from '../types';

const DATA_URL = import.meta.env.BASE_URL + 'shots_index.json.gz';

export function useShotSearch() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIndexing, setIsIndexing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Keep reference to search engine
  const miniSearchRef = useRef<MiniSearch<Shot> | null>(null);
  const allShotsRef = useRef<Shot[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error(`Failed to load shot data from ${DATA_URL}`);
        
        let data: Shot[];
        
        // Check if we need to decompress (browser should handle if Content-Encoding is set, 
        // but for static hosting of .gz file we might need manual decompression)
        // Note: GitHub Pages does not automatically serve .gz with Content-Encoding header 
        // for .json.gz files usually, so we treat it as a binary stream to decompress.
        try {
             const ds = new DecompressionStream('gzip');
             const decompressedStream = response.body?.pipeThrough(ds);
             if (!decompressedStream) throw new Error('Stream is empty');
             data = await new Response(decompressedStream).json();
        } catch (e) {
            console.warn("Decompression failed or not needed, trying plain JSON", e);
            // Fallback in case it was served decompressed (some servers might auto-decompress)
            // or if we switched back to .json
            const clone = response.clone();
            data = await clone.json();
        }
        
        allShotsRef.current = data;
        setShots(data.slice(0, 2000)); // Initial display limited to avoid lag
        
        setIsLoading(false);
        
        // Initialize search index in background
        setTimeout(() => {
            try {
                const miniSearch = new MiniSearch<Shot>({
                    fields: ['search_text'], // Fields to index
                    storeFields: ['id', 'player', 'team', 'x', 'y', 'made', 'year', 'date', 'dist'], // Fields to return
                    searchOptions: {
                        boost: { player: 2, team: 1.5 },
                        prefix: true,
                        fuzzy: 0.2
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

  const search = (query: string, filters: SearchFilters) => {
    if (!query && filters.year === 'all' && filters.made === 'all') {
      setShots(allShotsRef.current.slice(0, 2000)); // Return sample of all shots
      return;
    }

    let results: Shot[] = [];

    // If there is a query, use MiniSearch
    if (query && miniSearchRef.current) {
      // @ts-ignore - MiniSearch types can be tricky with storeFields
      const searchResults = miniSearchRef.current.search(query);
      // Map back to full shot objects (or use stored fields)
      // MiniSearch returns hits with score, etc. We cast to Shot.
      results = searchResults.map(hit => hit as unknown as Shot);
    } else {
      // No query, start with all (or filtered subset if huge)
      results = allShotsRef.current;
    }

    // Apply filters
    results = results.filter(shot => {
      if (filters.year !== 'all' && shot.year !== filters.year) return false;
      if (filters.made !== 'all') {
         const isMade = filters.made === true ? 1 : 0;
         if (shot.made !== isMade) return false;
      }
      return true;
    });

    // Limit results for performance
    setShots(results.slice(0, 2000));
  };

  return {
    shots,
    isLoading,
    isIndexing,
    error,
    search
  };
}
