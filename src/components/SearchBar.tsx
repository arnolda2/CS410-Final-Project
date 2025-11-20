import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  // Function to get suggestions for autocomplete
  onQueryChange: (query: string) => string[]; 
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onQueryChange }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      onSearch(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    // Suggest players if we have enough chars and it looks like a name start
    // Simple logic: if text is short or we are typing the first word
    if (val.length > 1) {
      // check if we already have a comma (simple heuristic to stop suggesting after player selected)
      if (!val.includes(',')) {
          const playerMatches = onQueryChange(val);
          setSuggestions(playerMatches);
          setShowSuggestions(playerMatches.length > 0);
      } else {
          setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPlayer = (player: string) => {
    setQuery(`${player}, `);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mb-6" ref={wrapperRef}>
      <div className="flex items-center w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:ring-1 shadow-sm transition-all">
        <div className="flex items-center pl-2 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        <input
            ref={inputRef}
            type="text"
            className="flex-1 ml-3 bg-transparent outline-none py-2 placeholder:text-slate-400"
            placeholder="Search shots (e.g. 'Steph Curry, corner 3')..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
                if (query.length > 1 && !query.includes(',') && suggestions.length > 0) {
                    setShowSuggestions(true);
                }
            }}
        />
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto overflow-x-hidden">
          <div className="p-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 tracking-wider">Suggested Players</div>
          {suggestions.map((player) => (
            <div
              key={player}
              className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 font-medium transition-colors"
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
