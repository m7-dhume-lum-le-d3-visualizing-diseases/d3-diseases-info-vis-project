
//Code for the main World Map is taken mostly taken from https://blockbuilder.org/abrahamdu/50147e692857054c2bf88c443946e8a5 ,
// Also referencing https://blog.soshace.com/mapping-the-world-creating-beautiful-maps-and-populating-them-with-data-using-d3-js/, please modify to our own

var selectedMinYear = 2010; // default, gets updated on slider
var selectedMaxYear = 2017;
var selectedDisease = "malaria"; // default, gets updated on dropdown
var min = 10000;
var max = 5000000;

function updateMap() {
    displayMap(selectedDisease);
}

// 2 value range slider (jquery)
$(function() {
    $( "#slider-3" ).slider({
       range: true,
       min: 2005,
       max: 2017,
       values: [ 2010, 2017 ],
       slide: function( event, ui ) {
          $( "#year" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
          selectedMinYear = ui.values[0];
          selectedMaxYear = ui.values[1];
       }
    });
    $( "#year" ).val($( "#slider-3" ).slider( "values", 0 ) +
       " - " + $( "#slider-3" ).slider( "values", 1 ) );
 });


// Color scale
color = d3.scaleLinear() 
  .domain([0,min,max]) 
  .range(["yellow", "orange", "brown"]) 
  .interpolate(d3.interpolateHcl);


window.onload = function() {
    clickDropDown()
};
function clickDropDown() {
    $("#malariaDrop").on("click", ()=>{
        displayMap("malaria");
        selectedDisease = "malaria";
    });
    $("#choleraDrop").on("click", ()=>{
        displayMap("cholera");
        selectedDisease = "cholera";
    });
    $("#hivAidsDrop").on("click", ()=>{
        displayMap("hivAids");
        selectedDisease = "hivAids";
    });
}
function displayMap(disease) {
    $(".worldMap").removeData();
    document.getElementById("dropDownButton").innerHTML=document.getElementById(`${disease}Drop`).innerHTML;
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
        .attr("height", height)
        .call(d3.zoom().on("zoom", function () {
            svg
                .selectAll('path') // supposed to stop outlines from scaling thick but ... not working
                .attr('transform', d3.event.transform); // zoom only works when your mouse is over a piece of land, you can drag pan too
         }))
    var worldMap = d3.select(".worldMap");

// Load in data and wait (async)
    d3.queue()
        .defer(d3.json, "data/world-topo.json")
        .defer(d3.csv, "data/world-country.csv")
        .defer(d3.json, "data/dataCleaned.json")
        .await(loadMap);


// d3 load map in
    function loadMap(error, world, names, map) {
        if (error)throw error;

        const countries1 = topojson.feature(world, world.objects.countries).features;
        const countries = countries1.filter(function (d) {
            return names.some(function (n) {
                if (d.id === n.id) return d.name = n.name;
            })
        });


        var diseaseInfo = map[disease];

        let result =mergeData( countries, diseaseInfo);
        var filterData = result.filter(d => d.data.year >= selectedMinYear && d.data.year <= selectedMaxYear); // Filter by selected year

        svg.selectAll("path")
            .data(filterData)
            .enter()
            .append("path")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "white")
            .attr("d", path)
            .style("fill", d => {return color(d.cases)})
            .on("mouseover", function (d, i) {
                d3.select(this).attr("fill", "grey").attr("stroke-width", 2);
                return worldMap.style("hidden", false).html(d.name);
            })
            .on("mousemove", function (d) {
                worldMap.classed("hidden", false)
                    .style("top", (d3.event.pageY) + "px")
                    .style("left", (d3.event.pageX+50) + "px")
                    .html(`<p>${d.name} (${d.data.year.toString()}) </p><p>Confirmed Cases: ${d.data.cases.toLocaleString()}</p><p>Confirmed Death: ${d.data.deaths.toLocaleString()}</p>`);
            })
            .on("mouseout", function (d, i) {
                d3.select(this).attr("fill", "white").attr("stroke-width", 1);
                worldMap.classed("hidden", true);
            });

    }

}
function mergeData (jsona, jsonb) {
    jsonb.forEach(i=>{
        jsona.forEach(j=>{
            if (i.name === j.name){
                if (!('data' in j)) j['data']=[];
                j.data.push(i)
            }

        });
    });
    return jsona;

}
