function drawMapChart()
{
    let svg = d3.select("body")
    .select("#vis")

    let files = {
      basemap : "../data/countries.geojson",
      familySpecies : "../data/out1.json"
    };

    const promises = [];
    Object.values(files).forEach(function(url, index) {
        promises.push(d3.json(url));
    });
    Promise.all(promises).then(function(data) {
        // console.log(data); //check if all data was loaded
        projection.fitExtent([[0, 0], [400, 600]], data[0]);
        visualizeMap(data);
    });
    // setup projection
    window.projection = d3.geoNaturalEarth1();
    // setup path generator (note it is a GEO path, not a normal path)
    window.path = d3.geoPath().projection(projection);
}

function visualizeMap(data)
{
    window.width = 459;
    window.height = 400;
    geojson = data[0];
    csvData = data[1];

    var visualizationWrapper = d3.select('#vis');
    csvData.forEach(function(data, i) {
        let domainValues = new Map();
        for(key in data.values)
        {
          if(data.values.hasOwnProperty(key))
          {
            domainValues.set(key, data.values[key]);
          }
        }
        let wrapper = visualizationWrapper
            .append('div')
            .attr('id' , data.key)
            .style('width' , width)
            .style('height' , height);
        createMap(wrapper, geojson , data, domainValues);
    });
    //legend
    drawLegend();
}

function drawLegend() {

  let svg = d3.select("body").select("#colorLegend");

    svg.append("text").attr("id", "tooltip").attr("x", 300).attr("y", 30).text("Species Count over multiple map");
    svg.append("text").attr("id", "min").attr("x", 275).attr("y", 80).text("min");
    svg.append("text").attr("id", "max").attr("x", 850).attr("y", 80).text("max");
    //create legend
    svg.append("g").attr("id", "legend");
    let legend = svg.select("g#legend");
    let legendColor = d3.scaleSequential(d3.interpolateReds)
      .domain([1915, 2019]);

    const defs = svg.append("defs");

    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

    linearGradient.selectAll("stop")
      .data(legendColor.ticks().map((t, i, n) => ({
        offset: `${100*i/n.length}%`,
        color: legendColor(t)
      })))
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    svg.append('g')
      .attr("class" , "colorLegend")
      .attr("transform", translate(200, 20))
      .append("rect")
      .attr('transform', translate(80, 30))
      .attr("width", 600)
      .attr("height", 10)
      .style("fill", "url(#linear-gradient)");
}
//https://github.com/kthotav/D3Visualizations/blob/master/New_York_Income_vs_Poverty/js/ny.js
// http://bl.ocks.org/chrtze/440f276856cf707963f5
// https://webkid.io/blog/multiple-maps-d3/
// http://bl.ocks.org/tomgp/9386620

function createMap(wrapper, geojson, data, domainValues)
{
  let color = d3.scaleSequential()
    .domain(d3.extent(Array.from(domainValues.values())))
    .interpolator(d3.interpolateReds)
    .unknown("#ddd");

    wrapper.append('p')
          .text(data.key)
          .attr('class', 'legend');

     let svg = wrapper.append('svg')
        .attr('id' , 'inner'+data.key)
        .style('width', width)
        .style('height', 400);

          //maps
          svg.selectAll('path')
          .data(geojson.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style('fill', function(d) {
                  let value = data.values[d.properties.ISO_A3];
                  if (value == 0) return "#ddd";
                  return color(value);
          })
          .attr('class', function(d) {
              return d.properties.ISO_A3;
          })
          .attr("transform", translate(0,-100))
          //interactivity
          .on('mouseenter', function(d, i) {
              let arr = Object.keys( data.values ).map(function ( key ) { return data.values[key]; });
              let min = d3.min(arr);
              let max = d3.max(arr);
              d3.select("body").select("#colorLegend").select("#max").text(max);
              d3.select("body").select("#colorLegend").select("#min").text(min);
              let country = d3.select(this);
              country.raise();
              country.classed("active", true);  //d3.select(!this).lower();
              notify("."+d.properties.ISO_A3, 'select')
          })
          .on('mouseleave', function(d) {
            d3.select("body").select("#colorLegend").select("#max").text("max");
            d3.select("body").select("#colorLegend").select("#min").text("min");

            let country = d3.select(this);
            country.lower();
            country.classed("active", false);
            d3.selectAll("div#details").remove();
            notify("."+d.properties.ISO_A3, 'unselect')
          })
          .on('select', function(self) {
            //tooltip of country
            let geoData = self.data();
            let div = d3.select("body").append("div");
             div.attr("id", "details");
             div.attr("class", "tooltip");
             let rows = div.append("table")
             .selectAll("tr")
             .data(geoData)
             .enter()
             .append("tr");
             rows.append("th").text("Country: ")
             rows.append("td").text(geoData[0].properties.ADMIN);
             let bbox = div.node().getBoundingClientRect();
             div.style("left", d3.event.pageX + "px")
             div.style("top",  (d3.event.pageY - bbox.height) + "px");
             //changing values for p tag
              self.node()
              .parentNode.parentNode
              .getElementsByTagName('p')[0].innerHTML = "Count of Species Endangered in " + data.key+ " Category : " + data.values[geoData[0].properties.ISO_A3];
          })
          .on('unselect', function(self) {
              self.node().parentNode.parentNode.getElementsByTagName('p')[0].innerHTML = data.key;
          });

          //call all Interactivity
      function notify(selector, eventName) {
          d3.selectAll(selector).nodes().forEach(function(el, i) {
              var shape = d3.select(el);
              shape.on(eventName)(shape);
          });
      }
}

function translate(x, y) {
    return "translate(" + String(x) + "," + String(y) + ")";
}
