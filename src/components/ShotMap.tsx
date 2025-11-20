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

    // Create scale
    const xScale = d3.scaleLinear()
      .domain([-250, 250])
      .range([0, width]);
    
    // Y coordinates in NBA data: -47.5 to 422.5 roughly.
    // We map -50 to 420 to cover the half court.
    // Y typically goes from baseline (negative) to halfcourt (positive).
    // But in SVG, y=0 is top. We want baseline at bottom? 
    // Usually shot charts show hoop at bottom or top.
    // Let's put Hoop at bottom (traditional TV view) or Top?
    // Most shot charts have hoop at bottom (y values increasing upwards?).
    // Actually standard NBA data: y increases as you go away from the basket.
    // So (0,0) is hoop.
    // If we want hoop at bottom, we need to map -50 (baseline) to height, and 420 (halfcourt) to 0.
    
    const yScale = d3.scaleLinear()
      .domain([-50, 420])
      .range([height, 0]); // Inverted so higher Y is higher on screen (wait, SVG y=0 is top)
      // If range is [height, 0], then -50 maps to height (bottom), 420 maps to 0 (top).
      // This puts hoop (0) near bottom. Correct.

    // Draw Court Lines (Simplified)
    const courtGroup = svg.append("g").attr("class", "court-lines");
    
    // Outer lines
    courtGroup.append("rect")
      .attr("x", xScale(-250))
      .attr("y", yScale(420))
      .attr("width", xScale(250) - xScale(-250))
      .attr("height", yScale(-50) - yScale(420))
      .attr("fill", "none")
      .attr("stroke", "black");

    // Hoop
    courtGroup.append("circle")
      .attr("cx", xScale(0))
      .attr("cy", yScale(0))
      .attr("r", xScale(7.5) - xScale(0)) // 1.5ft radius? No, rim is 18 inches = 1.5ft diameter -> 0.75ft radius.
      // Actually standard hoop is 1.5ft diameter. 
      // 0.75 * 10 = 7.5 units.
      .attr("fill", "none")
      .attr("stroke", "orange");
      
    // Backboard (4ft offset from baseline? Hoop is 5.25ft from baseline?)
    // Baseline is at -47.5 roughly.
    // Hoop at 0.
    // Backboard at -4.
    courtGroup.append("line")
      .attr("x1", xScale(-30))
      .attr("y1", yScale(-40)) // -4ft
      .attr("x2", xScale(30))
      .attr("y2", yScale(-40))
      .attr("stroke", "black");

    // 3-point line
    // Side lines (22ft from center = 220 units)
    // Arc (23.75ft = 237.5 units)
    
    // Left corner 3
    courtGroup.append("line")
      .attr("x1", xScale(-220))
      .attr("y1", yScale(-47.5))
      .attr("x2", xScale(-220))
      .attr("y2", yScale(90)) // Break point
      .attr("stroke", "black");
      
    // Right corner 3
    courtGroup.append("line")
      .attr("x1", xScale(220))
      .attr("y1", yScale(-47.5))
      .attr("x2", xScale(220))
      .attr("y2", yScale(90))
      .attr("stroke", "black");
      
    // 3-point line
    // Side lines (22ft from center = 220 units)
    // Arc (23.75ft = 237.5 units)
    
    // Left corner 3
    courtGroup.append("line")

    courtGroup.append("path")
        .attr("d", `M ${xScale(-220)} ${yScale(90)} A ${xScale(237.5)-xScale(0)} ${yScale(0)-yScale(237.5)} 0 0 1 ${xScale(220)} ${yScale(90)}`) 
        // Note: y scale is inverted, so ry might be negative diff? No, radius is absolute.
        // Wait, A rx ry ...
        // rx = scale(237.5) - scale(0) is width of radius in pixels.
        // ry = scale(0) - scale(237.5) is height of radius in pixels (since 0 is lower on screen/higher value than 237.5 in pixel coords? No, 0 is LOWER Y value, but HIGHER pixel value).
        // yScale(0) is e.g. 500. yScale(237.5) is e.g. 200. Diff is 300. Correct.
        .attr("fill", "none")
        .attr("stroke", "black");

    // Key (Restricted area etc) - Simplified
    courtGroup.append("rect")
      .attr("x", xScale(-80))
      .attr("y", yScale(-47.5))
      .attr("width", xScale(80) - xScale(-80))
      .attr("height", yScale(143.5) - yScale(-47.5)) // 19ft
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

