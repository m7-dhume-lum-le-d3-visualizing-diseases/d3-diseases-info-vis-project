
// Some code is referenced from: https://blockbuilder.org/abrahamdu/50147e692857054c2bf88c443946e8a5
// And: https://blog.soshace.com/mapping-the-world-creating-beautiful-maps-and-populating-them-with-data-using-d3-js/

var selectedMinYear = 2000; // default, gets updated on slider
var selectedMaxYear = 2018;

var selectedDisease = "malaria"; // default, gets updated on dropdown

var tempSummedCases = 0;
var tempSummedDeaths = 0;

var min = 10000;
var max = 10000000;

function updateMap() {
    $( "#year" ).val(selectedDisease + ": " + $( "#slider-3" ).slider( "values", 0 ) +
    " - " + $( "#slider-3" ).slider( "values", 1 ) );
    displayMap(selectedDisease);
}

// 2 value range slider (jquery)
$(function() {
    $( "#slider-3" ).slider({
       range: true,
       min: 2000,
       max: 2018,
       values: [ 2000, 2018 ],
       slide: function( event, ui ) {
          $( "#year" ).val(selectedDisease + ": " + ui.values[ 0 ] + " - " + ui.values[ 1 ] );
          selectedMinYear = ui.values[0];
          selectedMaxYear = ui.values[1];
       }
    });
    $( "#year" ).val(selectedDisease + ": " + $( "#slider-3" ).slider( "values", 0 ) +
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
        selectedDisease = "malaria";
        document.getElementById("dropDownButton").innerHTML = "Malaria";
    });
    $("#choleraDrop").on("click", ()=>{
        selectedDisease = "cholera";
        document.getElementById("dropDownButton").innerHTML = "Cholera";
    });
    $("#hivAidsDrop").on("click", ()=>{
        selectedDisease = "hivAids";
        document.getElementById("dropDownButton").innerHTML = "HIV/AIDS";
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
        // console.log(result);
        // console.log(result[0]);
        // console.log(result[1]);
        // console.log(result[1].name);
        // console.log(result[1].data[0].year);

        svg.selectAll("path")
            .data(result)
            .enter()
            .append("path")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "white")
            .attr("d", path)
            .style("fill", d => {
                // Try to return MIN year
                try{
                    var tempYearMin = (d.data[2018-selectedMinYear].year);
                }
                catch(e){ // Exception handle if it does not exist
                    var tempYearMin = selectedMinYear;
                }
                // Try to return MAX year
                try{
                    var tempYearMax = (d.data[2018-selectedMaxYear].year);
                }
                catch(e){ // Exception handle if it does not exist
                    var tempYearMax = selectedMaxYear;
                }
                // Try to SUM CASES
                try{
                    var i;
                    tempSummedCases = 0;
                    var difference = 0;
                    for (i = selectedMinYear; i < selectedMaxYear; i++) {
                        difference = 2018-i; // ie. Min = 2013, Max = 2015. This iteration does: 2018-2013 = 4, 2018-2014 = 3, 2018-2015 = 2, and sums data[4], data[3], data[2].
                        try{
                            tempSummedCases += d.data[difference].cases; // We can sum for example, sum the years 2013-2015 with data[4] + data[3] + data[2].
                        }
                        catch(e){
                            tempSummedCases += 0;
                        }
                    }
                    /* -- DATA STRUCTURE --
                    data[0] = YEAR 2018. 
                    data[1] = YEAR 2016. 
                    data[2] = YEAR 2015.
                    data[3] = YEAR 2014... and so on 
                    assuming the first entry is Year 2018. It might also be:
                    data[0] = YEAR 2018.
                    data[1] = YEAR 2014.
                    data[2] = YEAR 2008. (note our data may have missing years so we have to take that into account)
                    */
                }
                catch(e){
                    tempSummedCases = 0; // Exception handle if it does not exist
                }                                                
                try{
                    return color(tempSummedCases);  // Try to return cases to color the region accordingly based on sum of cases
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
                // Try to return MIN year
                try{
                    var tempYearMin = (d.data[2018-selectedMinYear].year);
                }
                catch(e){ // Exception handle if it does not exist
                    var tempYearMin = selectedMinYear;
                }
                // Try to return MAX year
                try{
                    var tempYearMax = (d.data[2018-selectedMaxYear].year);
                }
                catch(e){ // Exception handle if it does not exist
                    var tempYearMax = selectedMaxYear;
                }
                // Try to SUM CASES
                try{
                    var i;
                    tempSummedCases = 0;
                    var difference = 0;
                    for (i = selectedMinYear; i < selectedMaxYear; i++) {
                        difference = 2018-i;
                        try{
                            tempSummedCases += d.data[difference].cases;
                        }
                        catch(e){
                            tempSummedCases += 0;
                        }
                    }
                }
                catch(e){
                    var tempSummedCases = 0; // Exception handle if it does not exist
                }
                // Try to SUM DEATHS
                try{
                    var i;
                    tempSummedDeaths = 0;
                    var difference = 0;
                    for (i = selectedMinYear; i < selectedMaxYear; i++) {
                        difference = 2018-i;
                        try{
                            tempSummedDeaths += d.data[difference].deaths;
                        }
                        catch(e){
                            tempSummedDeaths += 0;
                        }
                    }
                }
                catch(e){
                    tempSummedDeaths = 0; // Exception handle if it does not exist
                }

                // Save to session to load for PeopleRatio page later
                console.log(tempSummedCases);
                sessionStorage.setItem("tempSummedCasesKey",tempSummedCases);
                sessionStorage.setItem("tempSummedDeathsKey",tempSummedDeaths);    
                showPeople(); // Update people

                // DISPLAY hover text box of year range, cases, and deaths
                worldMap.classed("hidden", false)
                    .style("top", (d3.event.pageY) + "px")
                    .style("left", (d3.event.pageX+50) + "px")
                    .html(`<p>${d.name} (${tempYearMin.toString()}-${tempYearMax.toString()}) </p><p>Confirmed Cases: ${tempSummedCases.toLocaleString()}</p><p>Confirmed Death: ${tempSummedDeaths.toLocaleString()}</p>`);
            })
            .on("mouseout", function (d, i) {
                d3.select(this).attr("fill", "white").attr("stroke-width", 1);
                worldMap.classed("hidden", true);
            });
    }
}

// Merge JSON data for more efficient query
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
