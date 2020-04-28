let drawMapChart = function(data) {
   window.width = 960,
    window.height = 600;

  console.log(data);

  window.svg = d3.select("body").select("svg#map");

  window.g = {
    basemap: svg.select("g#basemap"),
    // streets: svg.select("g#streets"),
    // outline: svg.select("g#outline"),
    // cases: svg.select("g#arrests"),
    tooltip: svg.select("g#tooltip"),
    details: svg.select("g#details")
  };
  //setup tooltip (shows neighborhood name)
  window.tip = g.tooltip.append("text").attr("id", "tooltip");
  tip.attr("text-anchor", "end");
  tip.attr("dx", -5);
  tip.attr("dy", -5);
  tip.style("visibility", "hidden");

  // setup projection
  window.projection = d3.geoNaturalEarth1();

  const urls = {
    //basemap: "countriesList.json"
    //basemap: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
    //USE THIS
    basemap : "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
    //basemap : "custom.geojson"
    // basemap : "https://raw.githubusercontent.com/Dhartim/dataviscourse_iucnredlist/horizontal/data/world.json"
    // streets: "https://data.sfgov.org/resource/hn5x-7sr8.geojson?$limit=8000",

  };
  // setup path generator (note it is a GEO path, not a normal path)
  window.path = d3.geoPath().projection(projection);
  d3.json(urls.basemap).then(function(json) {
    // makes sure to adjust projection to fit all of our regions
    projection.fitSize([
      960, 600
    ], json);
    // draw the land and neighborhood outlines
    drawBasemap(json, data);
    //draw data in map
    //drawData(data);
  });
};

function drawBasemap(json, data) {
  console.log("basemap", json);
  console.log("data from file", data);
  let mapData = new Map();
  data.forEach((item,i) => {
    mapData.set(item["CountryCode"], item["Total Species"]);
  });

  console.log("map = ", mapData);
  // console.log(d3.extent(Array.from(mapData.values())));
  let color = d3.scaleSequential()
    .domain(d3.extent(Array.from(mapData.values())))
    .interpolator(d3.interpolateReds)
    .unknown("#ddd");


  const basemap = g.basemap
  .selectAll("path.land")
  .data(json.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("class", "land")
  .attr("fill", function (d) {
      return color(mapData.get(d.properties.ISO_A3));
  });
  //now figure out how to add filter with respect to drop down
  
  //legends
  // svg.append("text").attr("id", "tooltip").attr("x", 0).attr("y", 280).text("Total Species Count");
  // const defs = svg.append("defs");
  //
  // const linearGradient = defs.append("linearGradient")
  //   .attr("id", "linear-gradient");
  //
  // linearGradient.selectAll("stop")
  //   .data(color.ticks().map((t, i, n) => ({
  //     offset: `${100*i/n.length}%`,
  //     color: color(t)
  //   })))
  //   .enter().append("stop")
  //   .attr("offset", d => d.offset)
  //   .attr("stop-color", d => d.color);
  //
  // svg
  //   .append('g')
  //   .append("rect")
  //   .attr("transform", translate(10, 300))
  //   .attr("width", width - 3 * 100 - 2 * 100 - 100)
  //   .attr("height", 5)
  //   .style("fill", "url(#linear-gradient)");
  // const colorLegendG = svg.append('g').attr("transform", translate(10,300));
  // const colorLegend = d3.legendColor().scale(color).shape('circle').shapePadding(2)
  // colorLegendG.call(colorLegend);
  // colorLegendG.selectAll('text').attr("class", "text").attr('font-size', "5");

  // add tooltip
  basemap.on("mouseover.tooltip", function(d) {
    tip.text(d.properties.ADMIN + '\n' + mapData.get(d.properties.ISO_A3));
    tip.style("visibility", "visible");
  }).on("mousemove.tooltip", function(d) {
    const coords = d3.mouse(g.basemap.node());
    tip.attr("x", coords[0]);
    tip.attr("y", coords[1]);
  }).on("mouseout.tooltip", function(d) {
    tip.style("visibility", "hidden");
  });

//reference for map https://www.d3-graph-gallery.com/graph/choropleth_basic.html
//reference for color scheme https://observablehq.com/@d3/color-schemes

}

// function drawData(data)
// {
//   var TotalCases = d3.map();
//   console.log("data from file" , data);
//   let colorScale = d3.scaleThreshold()
//     .range(d3.schemeBlues[7]);
//
//   //draw data layer on map
//
//     //legends
//     svg.append("text").attr("id", "tooltip").attr("x", 0).attr("y", 280).text("Species Count");
//     const colorLegendG = svg.append('g').attr("transform", translate(10,300));
//     const colorLegend = d3.legendColor().scale(colorScale).shape('circle').shapePadding(2)
//     colorLegendG.call(colorLegend);
//     colorLegendG.selectAll('text').attr("class", "text").attr('font-size', "5");
// }

function translate(x, y) {
    return "translate(" + String(x) + "," + String(y) + ")";
}
