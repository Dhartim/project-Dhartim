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

    //console.log("promises = " , promises);
    Promise.all(promises).then(function(data) {
        // console.log(data); //check if all data was loaded
        projection.fitExtent([[0, 0], [400, 600]], data[0]);
        visualizeMap(data);

        //any code that depends on 'data' goes here
    });

    // setup projection
    window.projection = d3.geoNaturalEarth1();
    // setup path generator (note it is a GEO path, not a normal path)
    window.path = d3.geoPath().projection(projection);

}

function visualizeMap(data)
{
    window.width = 400;
    window.height = 500;
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
        // console.log(domainValues);
        let wrapper = visualizationWrapper
            .append('div')
            // .attr('id' , data.key)
            .style('width' , width)
            .style('height' , height);

        createMap(wrapper, geojson , data, domainValues);
    });
}
//https://github.com/kthotav/D3Visualizations/blob/master/New_York_Income_vs_Poverty/js/ny.js
// http://bl.ocks.org/chrtze/440f276856cf707963f5
// https://webkid.io/blog/multiple-maps-d3/
// http://bl.ocks.org/tomgp/9386620

function createMap(wrapper, geojson, data, domainValues)
{
  // console.log(d3.extent(Array.from(domainValues.values())));
  let color = d3.scaleSequential()
    .domain(d3.extent(Array.from(domainValues.values())))
    .interpolator(d3.interpolateReds)
    .unknown("#ddd");

    wrapper.append('p')
          .text(data.key)
          .attr('class', 'legend');

     let svg = wrapper.append('svg')
        // .attr('id' , '#inner'+data.key)
        .style('width', width)
        .style('height', height);

          svg.selectAll('path')
          .data(geojson.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style('fill', function(d) {
                  let value = data.values[d.properties.ISO_A3];
                  return color(value);
          })
          .attr('class', function(d) {
              return d.properties.ISO_A3;
          })
          //interactivity
          .on('mouseenter', function(d, i) {
              notify("."+d.properties.ISO_A3, 'select')
          })
          .on('mouseleave', function(d) {
              notify("."+d.properties.ISO_A3, 'unselect')
          })
          .on('select', function(self) {
              let geoData = self.data();
              self.node().parentNode.parentNode.getElementsByTagName('p')[0].innerHTML = data.values[geoData[0].properties.ISO_A3];
          })
          .on('unselect', function(self) {
              self.node().parentNode.parentNode.getElementsByTagName('p')[0].innerHTML = data.key;
          })

          //NEED HELP WITH INTERACTIVITY ???
      function notify(selector, eventName) {
          d3.selectAll(selector).nodes().forEach(function(el, i) {
              var shape = d3.select(el);
                    shape.on(eventName)(shape);
                });
      }
}
//   console.log(data);
//   let mapWidth = 200;
//   let mapHeight = 300;
//
//   // let map = new Map();
//   // data.forEach((item, i) => {
//   //   map.set(item["Country"], item["Total Species"]);
//   // });
//   //
//   // console.log("map = ", map);
//   // let mapObj = Object.fromEntries(map.entries());
//   // console.log(mapObj);
//
//   let svg = d3.select("body").select("#vis");
//   projection = d3.geoNaturalEarth1();
//
//   let path = d3.geoPath().projection(projection);
//
//   const urls = {
//     basemap : "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
//     csvData : "../data/newData.csv"
//   };
//
//
//
//   function visualize(error, data)
//   {
//             var visualizationWrapper = d3.select('#vis');
//             data.forEach(function(data, i) {
//                 var wrapper = visualizationWrapper
//                     .append('div')
//                     .style({
//                         width: width + 'px',
//                         height: height + 'px'
//                     });
//                     d3.json(urls.basemap).then(function(json) {
//                       projection.fitExtent([[0, 0], [150, 180]], json);
//                     // draw the land and neighborhood outlines
//                     drawBasemap(json, data);
//                   });
//             });
//   }
//
//   //console.log(urls.csvData);
// // });
//   // data.data.forEach(function(data, i) {
//   //     var wrapper = visualizationWrapper
//   //         .append('div')
//   //         .style({
//   //             width: width + 'px',
//   //             height: height + 'px'
//   //         });
//   //
//   //     createMap(wrapper, states, data)
// // });
//
// }
//
// function drawBasemap(json, data)
// {
//   console.log("basemap", json);
//   // console.log("data from file", data);
//   let mapData = new Map();
//   data.forEach((item,i) => {
//       mapData.set(item["CountryCode"], item["Total Species"]);
//   });
//
//   // console.log("map = ", mapData);
//   // console.log(d3.extent(Array.from(mapData.values())));
//   let color = d3.scaleSequential()
//     .domain(d3.extent(Array.from(mapData.values())))
//     .interpolator(d3.interpolateReds)
//     .unknown("#ddd");
//
//   const basemap = g.basemap
//   .selectAll("path.land")
//   .data(json.features)
//   .enter()
//   .append("path")
//   .attr("d", path)
//   .attr("class", "land")
//   .attr("fill", function (d) {
//       return color(mapData.get(d.properties.ISO_A3));
//   });
// }
//
// function drawData(data)
// {
//   console.log(data);
// }
//
// // let path = d3.geoPath().projection(projection);
// // d3.json(urls.basemap).then(function(json) {
// //   // makes sure to adjust projection to fit all of our regions
// //   projection.fitSize([
// //     960, 600
// //   ], json);
//   // draw the land and neighborhood outlines
//   //drawBasemap(json);
//
//   //draw data in map
//   //drawData(data);
