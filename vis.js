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
  window.projection = d3.geoEquirectangular();

  const urls = {
    //basemap: "countriesList.json"
    basemap: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
    // streets: "https://data.sfgov.org/resource/hn5x-7sr8.geojson?$limit=8000",
    cases: "animalData.csv"

  };
  // setup path generator (note it is a GEO path, not a normal path)
  window.path = d3.geoPath().projection(projection);
  d3.json(urls.basemap).then(function(json) {
    // makes sure to adjust projection to fit all of our regions
    projection.fitSize([
      960, 600
    ], json);
    // draw the land and neighborhood outlines
    drawBasemap(json);
    //draw data in map
    d3.csv(urls.cases).then(drawData);
  });
};

function drawBasemap(json) {
  console.log("basemap", json);
  const basemap = g.basemap
  .selectAll("path.land")
  .data(json.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("class", "land");

  // add tooltip
  basemap.on("mouseover.tooltip", function(d) {
    tip.text(d.properties.name);
    tip.style("visibility", "visible");
  }).on("mousemove.tooltip", function(d) {
    const coords = d3.mouse(g.basemap.node());
    tip.attr("x", coords[0]);
    tip.attr("y", coords[1]);
  }).on("mouseout.tooltip", function(d) {
    tip.style("visibility", "hidden");
  });
}

function drawData(data)
{
  console.log("data from file" , data);
  let colorScale = d3.scaleThreshold()
    .domain([data["Total Species"]])
    .range(d3.schemeBlues[7]);

    //legends
    svg.append("text").attr("id", "tooltip").attr("x", 0).attr("y", 280).text("Species Count");
    const colorLegendG = svg.append('g').attr("transform", translate(10,300));
    const colorLegend = d3.legendColor().scale(colorScale).shape('circle').shapePadding(2)
    colorLegendG.call(colorLegend);
    colorLegendG.selectAll('text').attr("class", "text").attr('font-size', "5");
}

function translate(x, y) {
    return "translate(" + String(x) + "," + String(y) + ")";
}
