var data = [
    {
        name: "Exploitation",
        value: 37
    },
    {
        name: "Habitat Degradation/Change",
        value: 31.4
    },
    {
        name: "Habitat Loss",
        value: 13.4
    },
    {
        name: "Climate Change",
        value: 7.1
    },
    {
        name: "Invasive Species/Genes",
        value: 5.1
    },
    {
        name: "Pollution",
        value: 4
    },
    {
        name: "Disease",
        value: 2
    },
]


var width_wild = 700,
    height_wild = 800;
var stroke = innerRadius_wild > 0 ? "none" : "white", // stroke separating widths
    strokeWidth = 1, // width of stroke separating wedges
    strokeLinejoin = "round", // line join of stroke separating wedges
    padAngle = stroke === "none" ? 1 / outerRadius : 0;

var innerRadius_wild = 0,
    outerRadius_wild = 200;
labelRadius = (innerRadius_wild * 0.2 + outerRadius_wild * 0.8);
const N = data.map(d => { return d.name })
const V = data.map(d => { return d.value })
const I = d3.range(N.length).filter(i => !isNaN(V[i]));
const names = N

var color_wild = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, names.length + 1))


// const color_wild = d3.scaleOrdinal(d3.schemeCategory10).domain(names);
const arcs = d3.pie().padAngle(padAngle).sort(null).value(i => V[i])(I);
const arc_wild = d3.arc().innerRadius(innerRadius_wild).outerRadius(outerRadius_wild);
const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
const title = i => `${N[i]}\n${V[i]}`

const svg_wild = d3.select(".piechart").append("svg")
    .attr("width", width_wild + 100)
    .attr("height", height_wild-200)
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
const g_wild = svg_wild.append("g")
    .attr("transform", `translate(${width_wild / 2},${height_wild / 2-150})`);

var label_group = svg_wild.append("g")
    .attr("class", "label_group")
    .attr("transform", "translate(" + (width_wild / 2) + "," + (height_wild / 2 - 150) + ")");

g_wild.append("g")
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-linejoin", strokeLinejoin)
    .selectAll("path")
    .data(arcs).enter()
    .append("path")
    .attr("fill", d => { ;return color_wild(N[d.data]) })
    .attr("d", arc_wild)
// .append("title")
// .text(d => title(d.data))


g_wild.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(arcs).enter()
    .append("text")
    .attr("transform", d => {
        var coor = arcLabel.centroid(d); if (d.index === 6) {
            coor[1] -= 20
        }; return `translate(${coor})`
    })
    .style("font-size", "15px")
    .style("font-weight", 500)
    .style("fill","#F5F5DC")
    .text(d => {
        return d.value + "%"
    })

label_group.selectAll("line").data(arcs).enter().append("svg:line")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", -outerRadius_wild - 3)
    .attr("y2", -outerRadius_wild - 20)
    .style("fill","white")
    .attr("stroke", "gray")
    .attr("transform", function (d) {
        return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
    })
label_group.selectAll("text").data(arcs).enter().append("text")
    .attr("transform", function (d) {
        var offset_hor=30,offset_ver=30;
        if(d.value===2){
            offset_hor=-300
        }
        var trans = Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (outerRadius_wild + offset_hor) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (outerRadius_wild + offset_ver)
        return "translate(" + trans+ ")";
    })
    .attr("dy", function (d) {
        if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
            return 17;
        } else {
            return 5;
        }
    })
    .style("fill","white")
    .attr("text-anchor", function (d) {
        if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
            return "beginning";
        } else {
            return "end";
        }
    })
    .text(d => {
        return names[d.index]
    })