import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Shot } from '../types';

interface ShotMapProps {
  shots: Shot[];
}

// NBA Court Dimensions (feet)
// Hoop center is at (0,0)
const COURT_WIDTH = 50;
const COURT_HEIGHT = 47; // Half court

export const ShotMap: React.FC<ShotMapProps> = ({ shots }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    // Responsive dimensions
    const width = svgRef.current.clientWidth;
    // Maintain aspect ratio of half court (50ft x 47ft) plus some padding
    // 50ft wide, ~47ft high (from baseline -5.25 to 41.75)
    // Let's give it a bit more vertical space: -6 to 44
    const xDomain = [-25, 25];
    const yDomain = [-6, 43];
    const domainHeight = yDomain[1] - yDomain[0];
    const domainWidth = xDomain[1] - xDomain[0];
    
    const height = (width * domainHeight) / domainWidth;
    
    // Update SVG height
    svg.attr("height", height);

    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([0, width]);
    
    // Invert Y for drawing (SVG 0 is top) but mapping needs to be correct
    // In NBA data (relative to hoop): +Y is towards half court, -Y is baseline
    // In SVG: 0 is top. We want +Y at top? No, we want halfcourt at top usually?
    // Usually NBA charts show Hoop at bottom (or top).
    // Standard TV view: Hoop at bottom (or top) depending on camera.
    // If we want standard shot chart view: Hoop at BOTTOM, Halfcourt at TOP.
    // So +Y (towards halfcourt) should be UP (lower pixel value).
    
    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([height, 0]); // Map -6 (bottom) to height, 43 (top) to 0

    // Draw Court
    const courtGroup = svg.append("g").attr("class", "court");

    // Colors
    const courtColor = "#f8f9fa";
    const lineColor = "#000";
    const paintColor = "#e9ecef"; // Optional fill for key
    
    // 1. Paint Area (Key)
    // 16ft wide (-8 to 8). From baseline (-5.25) to Free Throw line (13.75)
    courtGroup.append("rect")
      .attr("x", xScale(-8))
      .attr("y", yScale(13.75)) // Top-left y (in svg coords, y is inverted so max Y value) -> Wait. rect y is top-left.
      // yScale(13.75) is the PIXEL value for Y=13.75.
      // yScale(-5.25) is the PIXEL value for Y=-5.25.
      // Since Y=13.75 > -5.25, yScale(13.75) is SMALLER (higher up).
      .attr("width", xScale(8) - xScale(-8))
      .attr("height", yScale(-5.25) - yScale(13.75))
      .attr("fill", "none") // paintColor
      .attr("stroke", lineColor)
      .attr("stroke-width", 1);

    // 2. Free Throw Circle
    // Center (0, 13.75), Radius 6ft
    // Top half (arc)
    courtGroup.append("path")
      .attr("d", `M ${xScale(-6)} ${yScale(13.75)} A 6 6 0 0 1 ${xScale(6)} ${yScale(13.75)}`)
      .attr("fill", "none")
      .attr("stroke", lineColor);
    
    // Bottom half (dashed)
    courtGroup.append("path")
      .attr("d", `M ${xScale(-6)} ${yScale(13.75)} A 6 6 0 0 0 ${xScale(6)} ${yScale(13.75)}`)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-dasharray", "4,4");

    // 3. Restricted Area
    // Arc radius 4ft from hoop (0,0)
    courtGroup.append("path")
      .attr("d", `M ${xScale(-4)} ${yScale(-1.25)} A 4 4 0 0 1 ${xScale(4)} ${yScale(-1.25)}`) // Adjusted starting Y to be consistent with NBA rules (slightly offset?) 
      // Actually standard RA is 4ft from center of basket.
      // Use full arc for simplicity or truncated?
      // Let's use simple 4ft arc from center.
      .attr("d", `M ${xScale(-4)} ${yScale(0)} A 4 4 0 0 1 ${xScale(4)} ${yScale(0)}`)
      .attr("fill", "none")
      .attr("stroke", lineColor);

    // 4. Three Point Line
    // Straight lines: 22ft from center. From baseline (-5.25) to break point (y=8.95?)
    // Radius 23.75ft.
    // Break point y = sqrt(23.75^2 - 22^2) = ~8.95
    
    // Left Line
    courtGroup.append("line")
      .attr("x1", xScale(-22))
      .attr("y1", yScale(-5.25))
      .attr("x2", xScale(-22))
      .attr("y2", yScale(8.95))
      .attr("stroke", lineColor);

    // Right Line
    courtGroup.append("line")
      .attr("x1", xScale(22))
      .attr("y1", yScale(-5.25))
      .attr("x2", xScale(22))
      .attr("y2", yScale(8.95))
      .attr("stroke", lineColor);
      
    // Arc
    // Start (-22, 8.95) -> End (22, 8.95)
    courtGroup.append("path")
        .attr("d", `M ${xScale(-22)} ${yScale(8.95)} A 23.75 23.75 0 0 1 ${xScale(22)} ${yScale(8.95)}`) 
        .attr("fill", "none")
        .attr("stroke", lineColor);

    // 5. Center Court
    // Halfcourt line at y = 41.75 (47 - 5.25)
    courtGroup.append("line")
      .attr("x1", xScale(-25))
      .attr("y1", yScale(41.75))
      .attr("x2", xScale(25))
      .attr("y2", yScale(41.75))
      .attr("stroke", lineColor);
    
    // Center Circle (Radius 6ft)
    // Center at (0, 41.75)
    // Only bottom half visible in half court view
    courtGroup.append("path")
      .attr("d", `M ${xScale(-6)} ${yScale(41.75)} A 6 6 0 0 0 ${xScale(6)} ${yScale(41.75)}`)
      .attr("fill", "none")
      .attr("stroke", lineColor);

    // Center Circle Inner (Radius 2ft)
    courtGroup.append("path")
      .attr("d", `M ${xScale(-2)} ${yScale(41.75)} A 2 2 0 0 0 ${xScale(2)} ${yScale(41.75)}`)
      .attr("fill", "none")
      .attr("stroke", lineColor);

    // 6. Hoop & Backboard
    // Backboard (4ft from baseline = -1.25 relative to hoop?)
    // Hoop is (0,0). Backboard is -1.25 behind hoop? No, hoop center is 1.25 in FRONT of backboard.
    // So Backboard is at y = -1.25. Width 6ft (-3 to 3).
    courtGroup.append("line")
      .attr("x1", xScale(-3))
      .attr("y1", yScale(-1.25))
      .attr("x2", xScale(3))
      .attr("y2", yScale(-1.25))
      .attr("stroke", lineColor)
      .attr("stroke-width", 2);

    // Hoop
    courtGroup.append("circle")
      .attr("cx", xScale(0))
      .attr("cy", yScale(0))
      .attr("r", xScale(0.75) - xScale(0)) // 18 inch diameter = 0.75ft radius
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 2);
      
    // Neck (connection to backboard)
    courtGroup.append("rect")
      .attr("x", xScale(-0.1))
      .attr("y", yScale(0)) // from hoop center
      .attr("width", xScale(0.1) - xScale(-0.1))
      .attr("height", yScale(-1.25) - yScale(0)) // to backboard
      .attr("fill", "orange");

    // Outer Boundary
    courtGroup.append("rect")
      .attr("x", xScale(-25))
      .attr("y", yScale(41.75)) // Top
      .attr("width", xScale(25) - xScale(-25))
      .attr("height", yScale(-5.25) - yScale(41.75)) // Height
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", 2);


    // DRAW SHOTS
    
    // Determine if scaling is needed
    // If max value > 30, assume tenths of feet (standard NBA data is -250 to 250)
    const maxVal = d3.max(shots, d => Math.abs(d.x)) || 0;
    const isTenths = maxVal > 40; // Safe buffer
    const scaleFactor = isTenths ? 0.1 : 1;

    const shotGroup = svg.append("g").attr("class", "shots");
    
    shotGroup.selectAll("circle")
      .data(shots)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.x * scaleFactor))
      .attr("cy", d => yScale(d.y * scaleFactor))
      .attr("r", 2.5) // slightly larger
      .attr("fill", d => d.made ? "#10b981" : "#ef4444") // Tailwind green-500, red-500
      .attr("opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);
      
  }, [shots]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4 border border-gray-200">
       <svg ref={svgRef} className="w-full block select-none" style={{ minHeight: '400px' }}></svg>
       <div className="mt-4 flex justify-center gap-6 text-sm text-gray-600">
         <div className="flex items-center gap-2">
           <span className="w-3 h-3 rounded-full bg-green-500 opacity-70"></span> Made
         </div>
         <div className="flex items-center gap-2">
           <span className="w-3 h-3 rounded-full bg-red-500 opacity-70"></span> Missed
         </div>
       </div>
    </div>
  );
};
