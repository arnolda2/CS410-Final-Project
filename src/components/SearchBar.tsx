import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, player: string | null) => void;
  // Function to get suggestions for autocomplete
  onQueryChange: (query: string) => string[]; 
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onQueryChange }) => {
  const [query, setQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Debounce search for parent component
  useEffect(() => {
    const debounce = setTimeout(() => {
      // If we have a selected player, the text query might be additional context like "corner 3"
      // Or if just typing, pass it all.
      onSearch(query, selectedPlayer);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query, selectedPlayer, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length > 1) {
      const playerMatches = onQueryChange(val);
      // Only show suggestions if we found players matching the start of the query
      // or if the query matches a player name logic.
      // For simplicity: If the query *is* a player name prefix.
      setSuggestions(playerMatches);
      setShowSuggestions(playerMatches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPlayer = (player: string) => {
    setSelectedPlayer(player);
    setQuery(''); // Clear query to let user type shot type
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const clearPlayer = () => {
    setSelectedPlayer(null);
    // Optionally keep query or clear it?
    // setQuery(''); 
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mb-6" ref={wrapperRef}>
      <div className="flex items-center w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:ring-1">
        <div className="flex items-center pl-2 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex flex-wrap items-center flex-1 gap-2 ml-2">
          {/* Player Chip */}
          {selectedPlayer && (
            <div className="flex items-center bg-nba-blue text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
              <span>{selectedPlayer}</span>
              <button onClick={clearPlayer} className="ml-1 hover:text-red-200 focus:outline-none">
                <X size={12} />
              </button>
            </div>
          )}

          <input
            type="text"
            className="flex-1 min-w-[150px] bg-transparent outline-none py-2"
            placeholder={selectedPlayer ? "Type shot context (e.g. 'corner 3')..." : "Search shots or player..."}
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length > 1 && suggestions.length > 0 && setShowSuggestions(true)}
          />
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 uppercase font-semibold bg-gray-50">Players</div>
          {suggestions.map((player) => (
            <div
              key={player}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
              onClick={() => handleSelectPlayer(player)}
            >
              {player}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
