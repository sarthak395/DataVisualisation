window.onload = draw_linechart();


var margin_tiger = { top: 10, right: 30, bottom: 50, left: 60 },
    width_tiger = 600 - margin_tiger.left - margin_tiger.right,
    height_tiger = 510 - margin_tiger.top - margin_tiger.bottom;

// append the svg object to the body of the page
var svg_tiger = d3.select(".circleLine")
    .append("svg")
    .attr("width", width_tiger + margin_tiger.left + margin_tiger.right)
    .attr("height", height_tiger + margin_tiger.top + margin_tiger.bottom)
var g_tiger = svg_tiger.append("g")
    .attr("transform",
        "translate(" + margin_tiger.left + "," + margin_tiger.top + ")");

var x_tiger = d3.scaleLinear()
var y_tiger = d3.scaleLinear()

// tooltip
var Tooltip = d3.select(".circleLine")
    .append("div").style("position", "absolute")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")


function draw_linechart() {
    // console.log("Replayed")
    var dataset = []
    d3.csv('https://raw.githubusercontent.com/sarthak395/DataVisualisation/main/Project/Datasets/tigerpopoveryears.csv').then(function (data) {
        dataset = data;

        // Add X axis 
        x_tiger.domain([d3.min(dataset, function (d) { return d.Year; }), d3.max(dataset, function (d) { return d.Year; })]).range([0, width_tiger]);
        g_tiger.append("g")
            .call(d3.axisBottom(x_tiger))
            .style("stroke", "white")
            .attr("transform", "translate(0," + height_tiger + ")")
            
        // add axis label as year
        g_tiger.append("text")
            .attr("transform","translate(" + (width_tiger/2) + " ," + (height_tiger + margin_tiger.top + 22) + ")")
            .style("text-anchor", "middle")
            .text("Year")
            .style("fill", "wheat")
           

        // Add Y axis
        y_tiger.domain([d3.min(dataset, function (d) { return d.Population; }), d3.max(dataset, function (d) { return d.Population; })]).range([height_tiger, 0]);
        g_tiger.append("g")
            .call(d3.axisLeft(y_tiger))
            .style("stroke", "white");;
        
        // add axis label as population
        g_tiger.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin_tiger.left)
            .attr("x", 0 - (height_tiger / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Population of Tiger")
            .style("fill", "wheat")


        draw_line(dataset)
    })
}

function tweenDash() {
    var l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
    return function (t) { return i(t) };
}

function transition(path) {
    path.transition()
        .duration(2000)
        .attrTween("stroke-dasharray", tweenDash)
        .on("end", function () { d3.select(this).call(transition); });
}



function draw_line(data) {
    // Add the line and add animation to line using interupt and length and delay and duration  

    console.log("Replayed")
    
    g_tiger.selectAll("line").remove()
    g_tiger.selectAll("circle").remove()
    g_tiger.selectAll("path").remove()


    g_tiger.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 1.5)
        .attr("class", "line")
        .attr("d", d3.line()
            .x(function (d) { return x_tiger(d.Year) })
            .y(function (d) { return y_tiger(d.Population) })
        ).interrupt().transition()
        .duration(2000)
        .attrTween("stroke-dasharray", tweenDash)
        .on("end", function () {
            d3.select(this).interrupt();
        });


    // Add the points
    g_tiger
        .append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x_tiger(d.Year) })
        .attr("cy", function (d) { return y_tiger(d.Population) })
        .attr("r", 5)
        .attr("fill", "#69b3a2")
        .on("mouseover", function (d) {
            Tooltip
                .style("opacity", 1).style("z-index", 9999)
            d3.select(this)
                .style("fill", "wheat")
                .attr("r", 10)
        }).on("mousemove", function (d) {
            Tooltip
                .html("Year: " + d.Year + "<br>" + "Population: " + d.Population)
                .style("left", (d3.mouse(this)[0] + 840) + "px")
                .style("top", (d3.mouse(this)[1] + 1300) + "px")
        }).on("mouseleave", function (d) {
            Tooltip
                .style("opacity", 0).style("z-index", -9999)
            d3.select(this)
                .style("fill", "#69b3a2")
                .attr("r", 5)
        }).interrupt().transition()
        .duration(2000)
        .attrTween("stroke-dasharray", tweenDash)
        .on("end", function () {
            d3.select(this).call(transition);
        })
}
