import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Shot } from '../types';

interface ShotMapProps {
  shots: Shot[];
}

// NBA Court Dimensions (feet)
// The data typically comes in tenths of a foot.
// Width: 50ft = 500 units
// Height (Half court): 47ft = 470 units
const COURT_WIDTH = 500;
const COURT_HEIGHT = 470;

export const ShotMap: React.FC<ShotMapProps> = ({ shots }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const width = svgRef.current.clientWidth;
    // Maintain aspect ratio
    const height = (width * COURT_HEIGHT) / COURT_WIDTH;
    
    // Update SVG height
    svg.attr("height", height);

    // NBA Court Dimensions (feet)
    // Data is in FEET (not tenths of feet like some legacy NBA data).
    // Width: 50ft
    // Height (Half court): 47ft
    
    const xScale = d3.scaleLinear()
      .domain([-25, 25])
      .range([0, width]);
    
    // Y coordinates: Hoop is at (0,0). Baseline is at -5.25ft. Halfcourt at 41.75ft.
    // We map roughly -6 to 42 to cover the half court.
    
    const yScale = d3.scaleLinear()
      .domain([-6, 42])
      .range([height, 0]); 

    // Draw Court Lines (Simplified)
    const courtGroup = svg.append("g").attr("class", "court-lines");
    
    // Outer lines (50ft width, 47ft height from baseline)
    // Baseline at -5.25, Halfcourt at 41.75
    courtGroup.append("rect")
      .attr("x", xScale(-25))
      .attr("y", yScale(41.75))
      .attr("width", xScale(25) - xScale(-25))
      .attr("height", yScale(-5.25) - yScale(41.75))
      .attr("fill", "none")
      .attr("stroke", "black");

    // Hoop (Radius 0.75ft)
    courtGroup.append("circle")
      .attr("cx", xScale(0))
      .attr("cy", yScale(0))
      .attr("r", xScale(0.75) - xScale(0))
      .attr("fill", "none")
      .attr("stroke", "orange");
      
    // Backboard (4ft wide, flat) - 4ft from baseline? No, 4ft from hoop center to backboard?
    // Center of hoop is 1.25ft from backboard face (which is 4ft from baseline).
    // So Backboard is at Y = -1.25. Width is 6ft.
    courtGroup.append("line")
      .attr("x1", xScale(-3))
      .attr("y1", yScale(-1.25))
      .attr("x2", xScale(3))
      .attr("y2", yScale(-1.25))
      .attr("stroke", "black");

    // 3-point line
    // Side lines (22ft from center, straight)
    // Arc (23.75ft radius)
    
    // Left corner 3 (From baseline -5.25 to break point)
    // Break point is where y = sqrt(23.75^2 - 22^2) = ~8.95
    courtGroup.append("line")
      .attr("x1", xScale(-22))
      .attr("y1", yScale(-5.25))
      .attr("x2", xScale(-22))
      .attr("y2", yScale(8.95)) 
      .attr("stroke", "black");
      
    // Right corner 3
    courtGroup.append("line")
      .attr("x1", xScale(22))
      .attr("y1", yScale(-5.25))
      .attr("x2", xScale(22))
      .attr("y2", yScale(8.95))
      .attr("stroke", "black");
      
    // Arc
    // We need to draw arc from (-22, 8.95) to (22, 8.95) with radius 23.75
    courtGroup.append("path")
        .attr("d", `M ${xScale(-22)} ${yScale(8.95)} A ${xScale(23.75)-xScale(0)} ${yScale(0)-yScale(23.75)} 0 0 1 ${xScale(22)} ${yScale(8.95)}`) 
        .attr("fill", "none")
        .attr("stroke", "black");

    // Key (Restricted area etc) - 12ft wide (radius 6?), 19ft from baseline?
    // 16ft wide usually (NBA). 
    // Let's just draw the paint box. 16ft wide (-8 to 8).
    // Top of key is at 19ft from baseline?
    // Baseline is -5.25. Top is 19 - 5.25 = 13.75.
    courtGroup.append("rect")
      .attr("x", xScale(-8))
      .attr("y", yScale(-5.25))
      .attr("width", xScale(8) - xScale(-8))
      .attr("height", yScale(13.75) - yScale(-5.25)) 
      .attr("fill", "none")
      .attr("stroke", "black");

    // Draw Shots
    // Use a separate group for shots
    const shotGroup = svg.append("g").attr("class", "shots");
    
    // Optimize: Use canvas for 2000+ points? SVG can handle 2000 fine.
    
    shotGroup.selectAll("circle")
      .data(shots)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 2) // small dots
      .attr("fill", d => d.made ? "green" : "red")
      .attr("opacity", 0.6);
      
  }, [shots]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4">
       <svg ref={svgRef} className="w-full" style={{ minHeight: '400px' }}></svg>
    </div>
  );
};
