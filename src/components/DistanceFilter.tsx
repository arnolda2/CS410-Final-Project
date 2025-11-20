import { useState, useEffect } from 'react';

interface Props {
  onChange: (min: number | undefined, max: number | undefined) => void;
}

export function DistanceFilter({ onChange }: Props) {
  const [min, setMin] = useState<string>('');
  const [max, setMax] = useState<string>('');

  useEffect(() => {
    const minVal = min === '' ? undefined : Number(min);
    const maxVal = max === '' ? undefined : Number(max);
    onChange(minVal, maxVal);
  }, [min, max, onChange]);

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm border border-gray-200">
      <span className="text-xs font-medium text-gray-500 uppercase">Dist (ft)</span>
      <input
        type="number"
        min="0"
        max="100"
        placeholder="0"
        className="w-12 p-1 text-sm border border-gray-300 rounded focus:border-nba-blue outline-none"
        value={min}
        onChange={(e) => setMin(e.target.value)}
      />
      <span className="text-gray-400">-</span>
      <input
        type="number"
        min="0"
        max="100"
        placeholder="94"
        className="w-12 p-1 text-sm border border-gray-300 rounded focus:border-nba-blue outline-none"
        value={max}
        onChange={(e) => setMax(e.target.value)}
      />
    </div>
  );
}

