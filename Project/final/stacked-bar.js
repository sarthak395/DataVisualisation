var margin_stack = {top: 20, right: 30, bottom: 50, left: 50},
        width_stack = 1000 - margin_stack.left - margin_stack.right,
        height_stack = 400 - margin_stack.top - margin_stack.bottom;
        year={}
        d3.csv("https://raw.githubusercontent.com/sarthak395/DataVisualisation/main/Project/Datasets/treecover_loss__ha.csv", (data)=> {
            var years = data.map(record => record.year)
            years = new Set(years)
            AllData = []
            yearsList = []
            reasons = []
            years.forEach(year => {
                yearsList.push(Number(year))
                temp = {}
                temp.year = year
                data.forEach(element => {
                    if(element.year == year)
                    {
                        temp[element.Reason] = element.loss_ha
                    }
                })
                AllData.push(temp)
            })
            reasons = [...Object.keys(AllData[0])].slice(1)
            
            var Tooltip = d3.select(".stacked_bar")
                .append("div")
                .style("opacity", 0)
                .style('position','absolute')
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")


            var svg_stack = d3.select(".stacked_bar")
                .append("svg")
                    .attr("width", width_stack + margin_stack.left + margin_stack.right)
                    .attr("height", height_stack + margin_stack.top + margin_stack.bottom)
                .append("g")
                    .attr("transform","translate(" + margin_stack.left + "," + margin_stack.top + ")");
            
            var x = d3.scaleBand()
                .domain(yearsList.sort())
                .range([0, width_stack])
                .padding([0.2])

            svg_stack.append("g")
                .attr("transform", "translate(0," + height_stack + ")")
                .call(d3.axisBottom(x).tickSizeOuter(0)).style("stroke","white").selectAll("text")
                .style("fill","white");

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([0, 200])
                .range([ height_stack, 0 ])

            svg_stack.append("g")
                .call(d3.axisLeft(y)).selectAll("text")
                .style("fill","white");

            color = {
                "Deforestation":  "rgb(107, 247, 92)",
                "Shifting agriculture": 'rgb(27, 217, 172)',
                "Urbanization": 'rgb(223, 64, 161)',
                "Commodity driven deforestation": 'rgb(255, 112, 78)',
                "Wildfire": 'rgb(57, 136, 225)',
                "Unknown": 'rgb(110, 64, 170)'
            }
            //stack the data? --> stack per subgroup
            var stackedData = d3.stack()
                .keys(reasons.reverse())
                (AllData)
            

            var mouseover = function(d) {
            // what subgroup are we hovering?
                var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
                var subgroupValue = d.data[subgroupName];
                // Reduce opacity of all rect to 0.2
                d3.selectAll(".myRect").style("opacity", 0.2)
                // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
                d3.selectAll("."+subgroupName.replaceAll(' ','_'))
                .style("opacity", 1)
                Tooltip
                  .style("opacity", 1)
            }

            // When user do not hover anymore
            var mouseleave = function(d) {
                // Back to normal opacity: 0.8
                d3.selectAll(".myRect")
                    .style("opacity",1.0)
                Tooltip
                  .style("opacity", 0)
            }

            // Show the bars
            svg_stack.append("g")
                .selectAll("g")
                // Enter in the stack data = loop key per key = group per group
                .data(stackedData)
                .enter().append("g")
                .attr("fill", function(d) { return color[d.key]; })
                .attr("class", function(d){ return "myRect " + d.key.replaceAll(' ','_') }) // Add a class to each subgroup: their name
                .selectAll("rect")
                // enter a second time = loop subgroup per subgroup to add all rectangles
                .data(function(d) { return d.map(ok => {ok.push(d.key);return ok}); })
                .enter().append("rect")
                    .attr("class",(d)=>{ return `y${d.data.year}-${d[2].replaceAll(' ','_')}`})
                    .attr("x", function(d) { return x(d.data.year); })
                    .attr("y", function(d) { return y(d[1]/1000); })
                    .attr("height", function(d) { return (y(d[0]) - y(d[1]))/1000; })
                    .attr("width",x.bandwidth())
                    .attr("stroke", "grey")
                .on("mouseover", mouseover)
                .on("mouseleave", mouseleave)
                .on('mousemove',(d)=>{
                    ele=document.querySelector(`.y${d.data.year}-${d[2].replaceAll(' ','_')}`)
                    console.log(ele)
                    Tooltip
                        .html(`Reason: ${d[2]}<br>Year: ${d.data.year}<br>Area of Tree Loss(in ha): ${((d[1]-d[0])/1000).toFixed(2)}kHa`)
                        .style("left", (d3.mouse(ele)[0]+margin_stack.left/2) + "px")
                        .style("top", (2580+d3.mouse(ele)[1]+margin_stack.top*2) + "px")
                })

            // Add X axis label:
            svg_stack
                .append("text")
                .attr("text-anchor", "middle")
                .style("position","relative")
                .attr("x", width_stack/2+10)
                .attr("y", height_stack + margin_stack.top+margin_stack.bottom-30)
                .style("fill","white")
                .text("Year");

            // Y axis label:
            svg_stack.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin_stack.left+15)
                .attr("x", -margin_stack.top-height_stack/2)
                .text("Tree Cover Loss(in KHa)")
                .style("fill","white")

            }); 