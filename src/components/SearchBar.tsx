import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query, onSearch]);

  return (
    <div className="relative w-full max-w-xl mx-auto mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
        placeholder="Search shots (e.g., 'Curry corner 3', 'LeBron dunk')..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};

