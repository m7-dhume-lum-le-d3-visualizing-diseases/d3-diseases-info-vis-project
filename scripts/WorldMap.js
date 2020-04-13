
//Code for the main World Map is taken mostly taken from https://blockbuilder.org/abrahamdu/50147e692857054c2bf88c443946e8a5 ,
// Also referencing https://blog.soshace.com/mapping-the-world-creating-beautiful-maps-and-populating-them-with-data-using-d3-js/, please modify to our own

window.onload = function() {
// Margins, borders
    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var width = 960 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

// Map projection
    var projection = d3.geoNaturalEarth1()
        .center([0, 15])
        .rotate([-9, 0])
        .scale([1300 / (2 * Math.PI)])
        .translate([450, 300]);

// Path
    var path = d3.geoPath()
        .projection(projection);

// SVG
    var svg = d3.select("svg")
        .append("g")
        .attr("width", width)
        .attr("height", height);
    var worldMap = d3.select(".worldMap");

// Load in data and wait (async)
    d3.queue()
        .defer(d3.json, "world-topo.json")
        .defer(d3.csv, "world-country.csv")
        .await(loadMap);

// d3 load map in
    function loadMap(error, world, names) {

        if (error) throw error;
        var countries1 = topojson.feature(world, world.objects.countries).features;
        countries = countries1.filter(function (d) {
            return names.some(function (n) {
                if (d.id == n.id) return d.name = n.name;
            })
        });

        svg.selectAll("path")
            .data(countries)
            .enter()
            .append("path")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "white")
            .attr("d", path)
            .on("mouseover", function (d, i) {
                d3.select(this).attr("fill", "grey").attr("stroke-width", 2);
                return worldMap.style("hidden", false).html(d.name);
            })
            .on("mousemove", function (d) {
                worldMap.classed("hidden", false)
                    .style("top", (d3.event.pageY) + "px")
                    .style("left", (d3.event.pageX + 10) + "px")
                    .html(d.name);
            })
            .on("mouseout", function (d, i) {
                d3.select(this).attr("fill", "white").attr("stroke-width", 1);
                worldMap.classed("hidden", true);
            });
    };
}