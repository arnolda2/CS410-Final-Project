import type { ZoneStats } from '../types';

interface Props {
  stats: ZoneStats[];
}

export function ZoneChart({ stats }: Props) {
  if (stats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No shot data available for analysis</div>;
  }

  // Take top 6 zones by volume to avoid clutter
  const displayStats = stats.slice(0, 6);

  return (
    <div className="space-y-4">
      {displayStats.map((stat) => (
        <div key={stat.zone} className="text-sm">
          <div className="flex justify-between mb-1">
            <span className="font-medium text-gray-700">{stat.zone}</span>
            <span className="text-gray-500 text-xs">{stat.attempts} shots</span>
          </div>
          
          <div className="relative h-6 bg-gray-100 rounded overflow-hidden mb-1">
             {/* Player Bar */}
            <div 
              className="absolute top-0 left-0 h-full bg-nba-blue transition-all duration-500"
              style={{ width: `${Math.min(stat.fgPct, 100)}%` }}
            ></div>
            {/* Label */}
            <span className="absolute inset-0 flex items-center px-2 text-xs text-white font-bold drop-shadow-md">
              {stat.fgPct.toFixed(1)}%
            </span>
          </div>

          {/* League Average Comparison */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
             <div className="w-full bg-gray-200 h-1.5 rounded relative">
                <div 
                    className="absolute top-0 left-0 h-full bg-gray-400"
                    style={{ width: `${Math.min(stat.leagueFgPct, 100)}%` }}
                ></div>
             </div>
             <span className="whitespace-nowrap">Lg: {stat.leagueFgPct.toFixed(1)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

