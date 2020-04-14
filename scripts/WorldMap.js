
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

        let result =mergeData(countries, diseaseInfo);
        console.log(result);
        console.log(result[0]);
        console.log(result[2]);
        console.log(result[3]);
        console.log(result[1].id);
        console.log(result[1].name);
        console.log(result[1].data[0].year);
        console.log(result[1].data[1].year);
        console.log(result[1].data[2].year);

        //var filterData = result.filter(d => d.data.year >= selectedMinYear && d.data.year <= selectedMaxYear); // Filter by selected year

        svg.selectAll("path")
            .data(result)
            .enter()
            .append("path")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "white")
            .attr("d", path)
            .style("fill", d => {
                try{
                    return color(d.data[0].cases);  // Try to return cases 
                }
                catch(e){
                    return color(0); // Exception handle if it does not exist (our data has some missing years, etc)
                }
            })
            .on("mouseover", function (d, i) {
                d3.select(this).attr("fill", "grey").attr("stroke-width", 2);
                return worldMap.style("hidden", false).html(d.name);
            })
            .on("mousemove", function (d) {
                try{
                    tempYearMin = (d.data[0].year);  // Try to return [year] (min range of slider)
                    tempYearMax = (d.data[1].year);  // Try to return [year] (max range of slider)
                }
                catch(e){
                    tempYearMin = 0; // Exception handle if it does not exist
                    tempYearMax = 0; // Exception handle if it does not exist
                }
                try{
                    tempCases = (d.data[0].cases);  // Try to return [cases]    TO-DO : SUM MIN AND MAX YEAR CASES
                                                                                // TO-DO : To help understand, data[0] = YEAR 2017. data[1] = 2016, data[2] = 2015, and so on
                                                                                // FOR EXAMPLE: d.data[0].cases + d.data[0].cases = 2016+2017 cases summed
                }
                catch(e){
                    tempCases = 0; // Exception handle if it does not exist
                }
                try{
                    tempDeaths = (d.data[0].deaths);  // Try to return [deaths] 
                }
                catch(e){
                    tempDeaths = 0; // Exception handle if it does not exist
                }

                worldMap.classed("hidden", false)
                    .style("top", (d3.event.pageY) + "px")
                    .style("left", (d3.event.pageX+50) + "px")
                    .html(`<p>${d.name} (${tempYearMin.toString()}-${tempYearMax.toString()}) </p><p>Confirmed Cases: ${tempCases.toLocaleString()}</p><p>Confirmed Death: ${tempDeaths.toLocaleString()}</p>`);
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

