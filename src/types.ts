export interface Shot {
  id: number;
  player: string;
  team: string;
  x: number;
  y: number;
  made: number; // 0 or 1
  year: number;
  search_text: string;
  date: string;
  dist: number;
}

export interface SearchFilters {
  year?: number | 'all';
  made?: boolean | 'all';
  player?: string | null; // New filter for specific player
}
