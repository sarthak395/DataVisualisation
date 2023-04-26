var margin_forest = { top: 50, right: 0, bottom: 0, left: 20 },
    width_forest = 1400 - margin_forest.left - margin_forest.right,
    height_forest = 1000 - margin_forest.top - margin_forest.bottom,
    innerRadius_forest = 100,
    outerRadius_forest = Math.min(width_forest, height_forest) / 2 - 25,
    flag = 0;   // the outerRadius goes from the middle of the SVG area to the border

// append the svg object
var svg_pop = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width_forest + margin_forest.left + margin_forest.right)
    .attr("height", height_forest + margin_forest.top + margin_forest.bottom)
svg_pop.append("g").append("rect").attr("width", "20").attr("height", "20").attr("fill", "#66c2a5").attr("x","20").attr("y","20")
svg_pop.append("g").append("rect").attr("width", "20").attr("height", "20").attr("fill", "red").attr("x","20").attr("y","50")
svg_pop.append("g").append("text").attr("x","50").attr("y","35").text("Forest Cover").style("fill","wheat")
svg_pop.append("g").append("text").attr("x","50").attr("y","65").text("Population").style("fill","wheat")

var g1 = svg_pop.append("g")
    .attr("transform", "translate(" + (width_forest / 2 + margin_forest.left - 100) + "," + (height_forest / 2 + margin_forest.top) + ")");
var g2 = svg_pop.append("g")
    .attr("transform", "translate(" + (width_forest / 2 + margin_forest.left - 100) + "," + (height_forest / 2 + margin_forest.top) + ")");


var x_pop = d3.scaleBand()
    .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
    .align(0)

var y_pop = d3.scaleRadial()
    .range([innerRadius_forest, outerRadius_forest])
var ybis = d3.scaleRadial()
    .range([innerRadius_forest, 5])

var dataset_forest = []

d3.csv("https://raw.githubusercontent.com/sarthak395/DataVisualisation/main/Project/Datasets/ForestAreaPop.csv").then(function (data_forest) {

    // X scale: common for 2 data series
    // This does nothing
    x_pop.domain(data_forest.map(function (d) { return d['State']; })); // The domain of the X axis is the list of states.

    // Y scale outer variable
    // Domain will be define later.
    y_pop.domain([100, 83000]); // Domain of Y is from 0 to the max seen in the data

    // Second barplot Scales
    // Domain will be defined later.
    ybis.domain([0, 200000000]);

    dataset_forest = data_forest;
    drawchart('1987')

});

function changechart() {
    var year = document.getElementById("myRange").value;
    const years = ['1987', '1989', '1991', '1993', '1995', '1997', '1999', '2001', '2003', '2005', '2007', '2011', '2013'];

    // find the value of the index in array which is closest to year
    var closest = years.reduce(function (prev, curr) {
        return (Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev);
    });

    const valdiv = document.getElementById("valuesl");

    valdiv.innerHTML = closest;
    // console.log(closest)
    drawchart(closest);
}

function drawchart(closest) {
    // Add the bars

    const u = g1
        .selectAll("path")
        .data(dataset_forest)

    u.enter()
        .append("path").merge(u)
        .attr("fill", "#69b3a2")
        .attr("class", "yo").transition().duration(500)
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius_forest)
            .outerRadius(function (d) { console.log(d); return y_pop(parseInt(d[`F${closest}`].replaceAll(',', ''))); })
            .startAngle(function (d) { return x_pop(d['State']); })
            .endAngle(function (d) { return x_pop(d['State']) + x_pop.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius_forest))

    // Add the labels
    g1.selectAll("text").remove()
    g1.append("g")
        .selectAll("g")
        .data(dataset_forest)
        .enter()
        .append("g")
        .attr("text-anchor", function (d) { return (x_pop(d['State']) + x_pop.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        .attr("transform", function (d) { return "rotate(" + ((x_pop(d['State']) + x_pop.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y_pop(parseInt(d[`F${closest}`].replaceAll(',', ''))) + 10) + ",0)" })
        .append("text")
        .text(function (d) { return (d['State']) })
        .attr("transform", function (d) { return (x_pop(d['State']) + x_pop.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
        .style("font-size", "15px").style("fill", "white")
        .attr("alignment-baseline", "middle");


    // Add the second series

    const u2 = g2
        .selectAll("path")
        .data(dataset_forest)

    u2.enter()
        .append("path").merge(u2).transition().duration(500)
        .attr("fill", "red")
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(function (d) { return ybis(0) })
            .outerRadius(function (d) { return ybis(parseInt(d[`P${closest}`].replaceAll(',', ''))); })
            .startAngle(function (d) { return x_pop(d['State']); })
            .endAngle(function (d) { return x_pop(d['State']) + x_pop.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius_forest))
}