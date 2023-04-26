var w = 700;
var h = 600;
var proj = d3.geo.mercator();
var path_india = d3.geo.path().projection(proj);
var t = proj.translate(); // the projection's default translation
var s = proj.scale() // the projection's default scale

var buckets = 9,
    colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]; // alternatively colorbrewer.YlGnBu[9]

var map = d3.select("#indiachart").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    //.call(d3.behavior.zoom().on("zoom", redraw))
    .call(initialize);

var india = map.append("svg:g")
    .attr("id", "india")

india.selectAll('svg').attr("transform", "scale(2)");

// var div = india.append("div")
//     .attr("class", "tooltip2")
//     .style("opacity", 0);

var Tooltip_india = d3.select("#indiachart")
    .append("div")
    .style("opacity", 0)
    .style('position', 'absolute')
    .attr("class", "tooltip2")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "10px")
    .style("padding", "5px")
    .style("font-size", "17px")


d3.json("https://raw.githubusercontent.com/sarthak395/DataVisualisation/main/Project/Datasets/india.json").then(function (json) {
    
    var maxTotal = d3.max(json.features, function (d) { return d.total });

    var colorScale = d3.scaleQuantile()
        .domain(d3.range(buckets).map(function (d) { return (d / buckets) * maxTotal }))
        .range(colors);


    var y = d3.scaleSqrt()
        .domain([0, 10000])
        .range([0, 300]);

    var yAxis = d3.axisRight(y)
        .tickValues(colorScale.domain())
    // decrease font and give some margin




    india.selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("d", path_india)
        .style("fill", colors[0])
        .style("opacity", 0.5)
        .on('mousemove', function (d, i) {
            d3.select(this).transition().duration(300).style("opacity", 1);
            // div.transition().duration(300)
            //     .style("opacity", 1)
            // Tooltip_india.text(d.id + " : " + d.total / 10 + "%")
            //     .style("left", (d3.event.pageX) + "px")
            //     .style("top", (d3.event.pageY - 1000) + "px")
            //     .style("font-size", "20px")
            //     ;
        })

        .on('mouseleave', function (d, i) {
            d3.select(this).transition().duration(300)
                .style("opacity", 0.5);
            // div.transition().duration(300)
            //     .style("opacity", 0);
        })
        .on('mouseenter', function (d, i) {
            d3.select(this).transition().duration(300)
                .style("opacity", 0.5);
            // div.transition().duration(300)
            //     .style("opacity", 0);

        });

    india.selectAll("path").transition().duration(1000)
        .style("fill", function (d) { return colorScale(d.total); });


    //Adding legend for our Choropleth


    var g = india.append("g")
        .attr("class", "key")
        .attr("transform", "translate(445, 305)")
        .call(yAxis);

    g.selectAll("rect")
        .data(colorScale.range().map(function (d, i) {
            return {
                y0: i ? y(colorScale.domain()[i - 1]) : y.range()[0],
                y1: i < colorScale.domain().length ? y(colorScale.domain()[i]) : y.range()[1],
                z: d
            };
        }))
        .enter().append("rect")
        .attr("width", 15)
        .attr("y", function (d) { return d.y0; })
        .attr("height", function (d) { return (d.y1 - d.y0); })
        .style("fill", function (d) { return d.z; })
        .style("margin", "auto")
        .style("opacity", 0.8)
        .style('transform','scaleY(2.5)');


    nationalparks()

});

function ramsar() {
    d3.json('https://raw.githubusercontent.com/sarthak395/DataVisualisation/main/Project/Datasets/ramsar.json').then(function (data) {
        console.log("Site Data", data);
        map.selectAll("image").remove()
        map.selectAll('.towns')
            .data(data)
            .enter().append('circle')
            .attr('class', 'towns')
            .attr("r", 5)
            .attr("fill", "red")
            .attr("cx", function (d) {
                console.log(d);
                var coords = proj([d.lng, d.lat])
                return coords[0];
            })
            .attr("cy", function (d) {
                var coords = proj([d.lng, d.lat])
                return coords[1]
            })
            .on('mouseover', function (d) {
                Tooltip_india
                    .style("opacity", 1)
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1)
            })
            .on('mousemove', function (d) {

                Tooltip_india
                    .html("Site Name: " + d.Town + "<br>" + "Designation Date: " + d.DesignationDate + "<br>" + "Area: " + d.Area)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 950) + "px")
            })
            .on('mouseleave', function (d) {
                Tooltip_india
                    .style("opacity", 0)
                d3.select(this)
                    .style("stroke", "none")
                    .style("opacity", 0.8)
            });
        //City Name
        map.selectAll('city_name')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'city_name')
            .attr("x", function (d) {
                console.log(d);
                var coords = proj([d.lng, d.lat, d.Town])
                return coords[0];
            })
            .attr("y", function (d) {
                var coords = proj([d.lng, d.lat, d.Town])
                return coords[1]
            }).text(function (d) {
                var coords = proj([d.lng, d.lat, d.Town])
                console.log(d.Town);
                return d.Town;
            })
            .attr('font-size', '0px')
            .attr('style', 'color:black')
            .attr('text-anchor', 'middle')
            // .attr('font-weight', 'bold')
            .attr('font-family', 'sans-serif')
            // add tooltip
            .attr('dx', '15')
            .attr('dy', '10')


    })
}

function nationalparks() {
    d3.json('https://raw.githubusercontent.com/sarthak395/DataVisualisation/main/Project/Datasets/nationalparks.json').then(function (data) {
        // console.log("Site Data", data);
        map.selectAll("circle").remove()
        map.selectAll('.towns')
            .data(data)
            .enter().append('svg:image')
            .attr("class", "towns").attr("transform", function (d) {
                return "translate(" + -20 / 2 + "," + -20 / 2 + ")";
            }).attr("xlink:href", function (d) {
                return 'map.png';
            })
            .attr("x", function (d) {
                // console.log(d);
                var coords = proj([d.lng, d.lat])
                // console.log(coords[0]);
                return coords[0];
            })
            .attr("y", function (d) {
                var coords = proj([d.lng, d.lat])
                return coords[1] - 23
            })
            .on('mouseover', function (d) {
                // console.log(d)
                Tooltip_india
                    .style("opacity", 1)
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1)
            })
            .on('mousemove', function (d) {
                Tooltip_india
                    .html("Site Name: " + d.Town + "<br>" + "Famous For: " + d.Animal)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 950) + "px")
            })
            .on('mouseleave', function (d) {
                Tooltip_india
                    .style("opacity", 0)
                d3.select(this)
                    .style("stroke", "none")
                    .style("opacity", 1)
            });
        //City Name
        map.selectAll('city_name')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'city_name')
            .attr("x", function (d) {
                // console.log(d);
                var coords = proj([d.lng, d.lat, d.Town])
                return coords[0];
            })
            .attr("y", function (d) {
                var coords = proj([d.lng, d.lat, d.Town])
                return coords[1]
            }).text(function (d) {
                var coords = proj([d.lng, d.lat, d.Town])
                // console.log(d.Town);
                return d.Town;
            })
            .attr('font-size', '0px')
            .attr('style', 'color:black')
            .attr('text-anchor', 'middle')
            // .attr('font-weight', 'bold')
            .attr('font-family', 'sans-serif')
            // add tooltip
            .attr('dx', '15')
            .attr('dy', '10')


    })
}



function initialize() {
    proj.scale(6700);
    proj.translate([-1240, 720]);
}