
var selectedDisease = "malaria"; // default, gets updated on dropdown

window.onload = function() {
    clickDropDown()
};

function clickDropDown() {
    $("#malariaDrop").on("click", ()=>{
        selectedDisease = "malaria";
        document.getElementById("dropDownButton").innerHTML = "Malaria";
        updateTreeMap();
    });
    $("#choleraDrop").on("click", ()=>{
        selectedDisease = "cholera";
        document.getElementById("dropDownButton").innerHTML = "Cholera";
        updateTreeMap();
    });
    $("#hivAidsDrop").on("click", ()=>{
        selectedDisease = "hivAids";
        document.getElementById("dropDownButton").innerHTML = "HIV/AIDS";
        updateTreeMap();
    });
}

updateTreeMap();

function updateTreeMap() {

    // clear previous
    d3.select("svg").remove();

    // margins
    var margin = {top: 20, right: 0, bottom: 0, left: 0},
        width = 1000,
        height = 800 - margin.top - margin.bottom,
        formatTwoDecimals = d3.format(".2s"),
        transitionAnim;

    // x scale
    var x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    // y scale
    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    // treemap
    var treemap = d3.layout.treemap()
        .children(function(d, depth) { return depth ? null : d.children; })
        .sort(function(a, b) { return a.value - b.value; })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(4)))
        .round(false);

    // svg
    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .style("margin-left", -margin.left + "px")
        .style("margin.right", -margin.right + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");

    // color scale
    var color = d3.scale.category10();

    // child node (click zoom)
    var childNode = svg.append("g")
        .attr("class", "childNode");

    childNode.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);

    // top text (Deaths by Country and Year)
    childNode.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em");

    // init treemap locations
    function initialize(root) {
        root.x = root.y = 0;
        root.depth = 0;
        root.dx = width;
        root.dy = height;
    }

    // aggregation of values
    function aggregate(d) {
        return d.children
            ? d.value = d.children.reduce(function(p, v) { return p + aggregate(v); }, 0)
            : d.value;
    }

    // recursive treemap computation
    function layout(d) {
        if (d.children) {
            treemap.nodes({children: d.children});
            d.children.forEach(function(c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                layout(c);
            });
        }
    }

    // display treemap
    function display(d) {

        // child node
        childNode
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text("Deaths by Country and Year " + name(d));

        var g1 = svg.insert("g", ".childNode")
            .datum(d)
            .attr("class", "depth");

        var g = g1.selectAll("g")
            .data(d.children)
            .enter().append("g");

        // transition treemap (zoom) on click
        g.filter(function(d) { return d.children; })
            .classed("children", true)
            .on("click", transition);

        g.selectAll(".child")
            .data(function(d) { return d.children || [d]; })
            .enter().append("rect")
            .attr("class", "child")
            .call(rect)
            .append("title")
            .text(function(d) { return d.name + " " + formatTwoDecimals(d.size); }); // print country and # of deaths in each node

        g.append("rect")
            .attr("class", "parent")
            .call(rect)
            .on("click", function(d) {
                if(!d.children){
                    window.open(d.url);
                }
            })
            .append("title")
            .text(function(d) { return d.name + " " + formatTwoDecimals(d.size); });

        g.append("foreignObject")
            .call(rect)
            .on("click", function(d) {
                if(!d.children){
                    window.open(d.url);
                }
            })
            .attr("class","foreignobj")
            .append("xhtml:div")
            .attr("dy", ".75em")
            .html(function(d) {
                if (d.size) {
                    return d.name + " (" + formatTwoDecimals(d.size) + ")";
                }
                if (d.value > 0 && typeof(d.value) !== "undefined") {
                    return d.name + " (" + formatTwoDecimals(d.value) + ")";
                }
                return d.name;
            })
            .attr("class","textdiv");

        // Do animation transition
        function transition(d) {
            if (transitionAnim || !d) return;
            transitionAnim = true;
            var g2 = display(d),
                t1 = g1.transition().duration(750),
                t2 = g2.transition().duration(750);

            // domain update
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

            svg.selectAll(".depth")
                .sort(function(a, b) { return a.depth - b.depth; });

            g2.selectAll("text").style("fill-opacity", 0);
            g2.selectAll("foreignObject div").style("display", "none");

            t1.selectAll("text").call(text).style("fill-opacity", 0);
            t2.selectAll("text").call(text).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);

            t1.selectAll(".textdiv").style("display", "none");
            t1.selectAll(".foreignobj").call(foreign);
            t2.selectAll(".textdiv").style("display", "block");
            t2.selectAll(".foreignobj").call(foreign);

            // remove previous nodes prior to transition
            t1.remove().each("end", function() {
                svg.style("shape-rendering", "crispEdges");
                transitionAnim = false;
            });
        }
        return g;
    }

    function text(text) {
        text.attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y); });
    }

    function rect(rect) {
        rect.attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y); })
            .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
            .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
            .style("background", function(d) { return d.parent ? color(d.name) : null; });
    }

    function foreign(foreign){
        foreign.attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y); })
            .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
            .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
    }

    // Return full name (parent + name)
    function name(d) {
        if (d.parent)
            return name(d.parent) + "." + d.name;
        else
            return d.name;
    }

    // Load JSON
    function loadJSONFile(file) {
        d3.json(file, function(root) {
            loadData(root);
        });
    }

    // Load Data
    function loadData(root) {
        initialize(root);
        aggregate(root);
        layout(root);
        display(root);
    }

    function sort(root,value_key) {
        for (var key in root) {
            if (key == "key") {
                root.name = root.key;
                delete root.key;
            }
            if (key == "values") {
                root.children = [];
                for (item in root.values) {
                    root.children.push(sort(root.values[item],value_key));
                }
                delete root.values;
            }
            if (key == value_key) {
                root.value = parseFloat(root[value_key]);
                delete root[value_key];
            }
        }
        return root;
    }

    $( document ).ready(function() {

        var filePath;
        // Load Malaria Data
        if (selectedDisease == "malaria")
            filePath = "cleanedData/MalariaCleaned.csv"
        else if (selectedDisease == "hivAids")
            filePath = "cleanedData/HIVCleaned.csv"
        else if (selectedDisease == "cholera")
            filePath = "cleanedData/CholeraCleaned.csv"

        d3.csv(filePath, function(csv_data){

            var nested_data = d3.nest()
                .key(function(d)  { return d.Location; })
                .key(function(d)  { return d.Period; })
                .entries(csv_data);

            // Create and add data (Deaths)
            var root = {};
            root.key = "Data";
            root.values = nested_data;
            root = sort(root,"Deaths");
            loadData(root);

        });
    });
}
