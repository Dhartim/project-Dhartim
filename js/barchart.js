function drawBarChart(data)
{
    console.log(data);
    var opt = d3.select(".opt").on("change", function() {
	  chart.update(data, this.value);
  });

  d3.select(".sort").on("change", function() {
    chart.update(data, opt.property("value"));
  });

  chart(data, opt.property("value"));

}
function chart(data, input) {
    console.log(data);

    var speed = 0

		var svg = d3.select("#chart"),
			margin = {top: 35, left: 40, bottom: 5, right: -15},
			width = +svg.attr("width") - margin.left - margin.right,
			height = +svg.attr("height") - margin.top - margin.bottom;

		var x = d3.scaleBand()
			.range([margin.left, width - margin.right])
			.padding(0.1)
			.paddingOuter(0.1)

		var y = d3.scaleLinear()
			.range([height - margin.bottom, margin.top])

		var xAxis = g => g
			.attr("transform",
				"translate(0," + (height - margin.bottom) + ")")
			.call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-10)");

    //   .attr("transform", function(d) {
    //   return "rotate(-55)"
    // });

		var yAxis = g => g
			.attr("transform",
				"translate(" + margin.left + ",0)")
			.call(d3.axisLeft(y))

		var yGrid = g => g
			.attr("transform",
				"translate(" + margin.left + ",0)")
			.call(d3.axisLeft(y).tickSize(-width + margin.right))
			.call(g => g.selectAll("text").remove())

		svg.append("g")
			.attr("class", "x-axis")


		svg.append("rect").attr("class", "block")
			.attr("x", 0)
			.attr("y", 0 + margin.left)
			.attr("height", height - margin.bottom)
			.attr("width", margin.left)
			.attr("fill", "#fff");

		var sorted = data.map(d => d.Region);

    svg.append("g")
      .attr("class", "y-grid")
      .style("opacity", "0.1")

      svg.append("g")
        .attr("class", "y-axis")

		update(data, input);

		function update(data, input) {

			data.sort(d3.select("#checkBox").property("checked")
				? (a, b) => b[input] - a[input]
				: (a, b) => sorted.indexOf(a.Region) - sorted.indexOf(b.Region));

			x.domain(data.map(d => d.Region))

			svg.selectAll(".x-axis").transition().duration(speed)
				.call(xAxis);

			y.domain([0, d3.max(data, d => d[input])]).nice()

			svg.selectAll(".y-axis").transition().duration(speed)
				.call(yAxis);
			svg.selectAll(".y-grid").transition().duration(speed)
				.call(yGrid);

			var bar = svg.selectAll(".bar")
				.data(data, d => d.Region)

			bar.exit().remove();

			bar = bar
				.enter().insert("g", ".block")
			.append("rect")
				.attr("class", "bar")
				.attr("fill", "#b01515")
				.attr("width", x.bandwidth())
				.merge(bar)

			bar.transition().duration(speed)
				.attr("x", d => x(d.Region))
				.attr("y", d => y(d[input]))
				.attr("height", d => y(0) - y(d[input]))

			var text = svg.selectAll(".text")
				.data(data, d => d.Region)

			text.exit().remove();

			text = text
				.enter().insert("g", ".block")
			.append("text")
				.attr("class", "text")
				.attr("text-anchor", "middle")
				.merge(text);

			text.transition().duration(speed)
				.attr("x", d => x(d.Region) + x.bandwidth() / 2)
				.attr("y", function(d) {
					return (y(d[input]) > height - margin.top
						? y(d[input]) - 5
						: y(d[input]) + 15)
				})
				.attr("fill", function(d) {
					return (y(d[input]) > height - margin.top
						? "#333"
						: "#fff")
				})
				.text(d => d[input]);

			svg.call(zoom);

			function zoom(svg) {

				const extent = [
					[margin.left, margin.top],
					[width - margin.right, height - margin.top]];

				var zooming = d3.zoom()
					.scaleExtent([1, 2])
					.translateExtent(extent)
					.extent(extent)
					.on("zoom", zoomed)

				svg.call(zooming);

				function zoomed() {

					x.range([margin.left, width - margin.right]
						.map(d => d3.event.transform.applyX(d)));

					svg.selectAll(".bar")
						.attr("x", d => x(d.Region))
						.attr("width", x.bandwidth());
					svg.selectAll(".text")
						.attr("x", d => x(d.Region) + x.bandwidth() / 2)
						.attr("y", function(d) {
							return (y(d[input]) > height - margin.top
								? y(d[input]) - 5
								: y(d[input]) + 15)
						})
						.attr("fill", function(d) {
							return (y(d[input]) > height - margin.top
								? "#333"
								: "#fff")
						})
						.attr("font-size", _ => x.bandwidth() > 50 ? 14 : 12)

					svg.selectAll(".x-axis").call(xAxis);
				}
			}
		}

    speed = 750

		chart.update = update;
	}
