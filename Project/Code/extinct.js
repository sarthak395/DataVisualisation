var data = {
    "name": "Extinct Species Data",
    "children": [
        {
            "name": "Extinct",
            "children": [
                {
                    "name": "Mammal",
                    "value": 81
                },
                {
                    "name": "Aves",
                    "value": 159
                },
                {
                    "name": "Reptilia",
                    "value": 24
                },
                {
                    "name": "Amphibia",
                    "value": 33
                },
                {
                    "name": "Pisces",
                    "value": 65
                },
            ]
        },
        {
            "name": "Critically Endg.",
            "children": [
                {
                    "name": "Mammal",
                    "value": 203
                },
                {
                    "name": "Aves",
                    "value": 223
                },
                {
                    "name": "Reptilia",
                    "value": 196
                },
                {
                    "name": "Amphibia",
                    "value": 545
                },
                {
                    "name": "Pisces",
                    "value": 455
                },
            ]
        },
        {
            "name": "Endangered",
            "children": [
                {
                    "name": "Mammal",
                    "value": 505
                },
                {
                    "name": "Aves",
                    "value": 460
                },
                {
                    "name": "Reptilia",
                    "value": 382
                },
                {
                    "name": "Amphibia",
                    "value": 848
                },
                {
                    "name": "Pisces",
                    "value": 643
                },
            ]
        },
        {
            "name": "Vulnerable",
            "children": [
                {
                    "name": "Mammal",
                    "value": 536
                },
                {
                    "name": "Aves",
                    "value": 798
                },
                {
                    "name": "Reptilia",
                    "value": 411
                },
                {
                    "name": "Amphibia",
                    "value": 670
                },
                {
                    "name": "Pisces",
                    "value": 1245
                },
            ]
        },
        {
            "name": "Near Threatened",
            "children": [
                {
                    "name": "Mammal",
                    "value": 345
                },
                {
                    "name": "Aves",
                    "value": 1001
                },
                {
                    "name": "Reptilia",
                    "value": 329
                },
                {
                    "name": "Amphibia",
                    "value": 402
                },
                {
                    "name": "Pisces",
                    "value": 548
                },
            ]
        },
    ]
}

var root = d3.hierarchy(data)
    .sum(d => d.value)

d3.partition()
    .size([2 * Math.PI, root.height + 1])
    (root);

// const color_ext = d3.scaleOrdinal(d3.schemeCategory10);
const color_ext = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))

const format = d3.format(",d");
const height_ext = 400, width_ext = 400, radius = 70;

const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

root = root.each(d => d.current = d);
root = root.each(d => {
    var depth = d.depth;
    var temp = d;
    while (temp.depth > 1) temp = temp.parent
    d.color_ext = color_ext(temp.data.name);
    d.opacity = 1 - (depth / 10);
})
const svg = d3.select(".extinctspecies").append("svg")
    .attr("viewBox", [20, 100, width_ext, width_ext / 2 + 100])
    .style("font", "10px sans-serif")
    .style("padding", "10px")

const g = svg.append("g")
    .attr("transform", `translate(${width_ext / 2},${height_ext / 2 + 40})`);

const path = g.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1)).enter()
    .append("path")
    .attr("fill", d => d.color_ext)
    .attr("fill-opacity", d => arcVisible(d.current) ? d.opacity : 0)
    .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
    .attr("d", d => arc(d.current));

path.filter(d => d.children)
    .style("cursor", "pointer")
    .on("click", clicked);

path.append("title")
    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

const label = g.append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .enter().append("text")
    .attr("dy", "0.35em")
    .style("font-size", d => {
        if (!d.children) {
            return "8px"
        } else
            return "8px"
    })
    .style("fill", "#F5F5DC")
    .attr("fill-opacity", d => +labelVisible(d.current))
    .attr("font-weight", 600)
    .attr("transform", d => labelTransform(d.current))
    .text(d => {
        if (!d.children) return `${d.data.name} : ${d.value}`
        else {
            return d.data.name
        }
    })

const parent = g.append("circle")
    .datum(root)
    .attr("r", radius)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("click", clicked);

function clicked(p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
    });

    const t = g.transition().duration(750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path.transition(t)
        .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
        })
        .filter(function (d) {
            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", d => arcVisible(d.target) ? d.opacity : 0)
        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")

        .attrTween("d", d => () => arc(d.current));

    label.filter(function (d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
    }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
}

function arcVisible(d) {
    return d.y1 <= 2 && d.y0 >= 1 && d.x1 > d.x0;
}

function labelVisible(d) {
    return d.y1 <= 2 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    let rot = x < 180 ? 0 : 180;
    return `rotate(${x - 90}) translate(${y},0) rotate(${rot})`;
}