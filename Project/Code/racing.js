var svg_race = d3.select(".racingPlot").append("svg")
   .attr("width", 1100)
   .attr("height", 700);

var tickDuration = 500;

var top_n = 12;
var height_race = 600;
var width_race = 960;

const margin_race = {
   top: 80,
   right: 0,
   bottom: 5,
   left: 0
};

let barPadding = (height_race - (margin_race.bottom + margin_race.top)) / (top_n * 5);

let title_race = svg_race.append('text')
   .attr('class', 'title')
   .attr('y', 55)
   .html('Forest cover of countries in % area of country')
   .style("fill", "white")
   .style("font-size", "20px");

let year = 1990;
let flag_play = true

function playButton() {
   flag_play = !flag_play
   if(!flag_play)
   document.getElementById("#racingPlot").innerHTML="Play"
   else if(flag_play)
   document.getElementById("#racingPlot").innerHTML="Pause"
}

d3.csv('https://raw.githubusercontent.com/sarthak395/DataVisualisation/main/Project/Datasets/racebardata.csv').then(function (data) {
   //if (error) throw error;

   console.log(data);

   data.forEach(d => {
      d.value = +d.value,
         d.lastValue = +d.lastValue,
         d.value = isNaN(d.value) ? 0 : d.value,
         d.year = +d.year,
         d.colour = d3.hsl(Math.random() * 360, 0.75, 0.75)
   });

   console.log(data);

   let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
      .sort((a, b) => b.value - a.value)
      .slice(0, top_n);

   yearSlice.forEach((d, i) => d.rank = i);

   console.log('yearSlice: ', yearSlice)

   let x_race = d3.scaleLinear()
      .domain([0, d3.max(yearSlice, d => d.value)])
      .range([margin_race.left, width_race - margin_race.right - 65]);

   let y_race = d3.scaleLinear()
      .domain([top_n, 0])
      .range([height_race - margin_race.bottom, margin_race.top]);

   let xAxis = d3.axisTop()
      .scale(x_race)
      .ticks(width_race > 500 ? 5 : 2)
      .tickSize(-(height_race - margin_race.top - margin_race.bottom))
      .tickFormat(d => d3.format(',')(d));

   svg_race.append('g')
      .attr('class', 'axis xAxis')
      .attr('transform', `translate(0, ${margin_race.top})`)
      .call(xAxis)
      .selectAll('.tick line')
      .classed('origin', d => d == 0);

   svg_race.selectAll('rect.bar')
      .data(yearSlice, d => d.name)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', x_race(0) + 1)
      .attr('width', d => x_race(d.value) - x_race(0) - 1)
      .attr('y', d => y_race(d.rank) + 5)
      .attr('height', y_race(1) - y_race(0) - barPadding)
      .style('fill', d => d.colour);

   svg_race.selectAll('text.label')
      .data(yearSlice, d => d.name)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x_race(d.value) - 8)
      .attr('y', d => y_race(d.rank) + 5 + ((y_race(1) - y_race(0)) / 2) + 1)
      .style('text-anchor', 'end')
      .html(d => d.name)
      .style("fill", "black");

   svg_race.selectAll('text.valueLabel')
      .data(yearSlice, d => d.name)
      .enter()
      .append('text')
      .attr('class', 'valueLabel')
      .attr('x', d => x_race(d.value) + 5)
      .attr('y', d => y_race(d.rank) + 5 + ((y_race(1) - y_race(0)) / 2) + 1)
      .text(d => d3.format(',.0f')(d.lastValue))
      .style("fill", "white");

   let yearText = svg_race.append('text')
      .attr('class', 'yearText')
      .attr('x', width_race - margin_race.right + 80)
      .attr('y', height_race - 25 + 50)
      .style('text-anchor', 'end')
      .html(~~year)
      .style("fill", "wheat")
   //   .call(halo, 10);

   let ticker = d3.interval(updateGraph, tickDuration);

   function updateGraph() {

      yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
         .sort((a, b) => b.value - a.value)
         .slice(0, top_n);

      yearSlice.forEach((d, i) => d.rank = i);

      //console.log('IntervalYear: ', yearSlice);

      x_race.domain([0, d3.max(yearSlice, d => d.value)]);

      svg_race.select('.xAxis')
         .transition()
         .duration(tickDuration)
         .ease(d3.easeLinear)
         .call(xAxis);

      let bars = svg_race.selectAll('.bar').data(yearSlice, d => d.name);

      bars
         .enter()
         .append('rect')
         .attr('class', d => `bar ${d.name.replace(/\s/g, '_')}`)
         .attr('x', x_race(0) + 1)
         .attr('width', d => x_race(d.value) - x_race(0) - 1)
         .attr('y', d => y_race(top_n + 1) + 5)
         .attr('height', y_race(1) - y_race(0) - barPadding)
         .style('fill', d => d.colour)
         .transition()
         .duration(tickDuration)
         .ease(d3.easeLinear)
         .attr('y', d => y_race(d.rank) + 5);

      bars
         .transition()
         .duration(tickDuration)
         .ease(d3.easeLinear)
         .attr('width', d => x_race(d.value) - x_race(0) - 1)
         .attr('y', d => y_race(d.rank) + 5);

      bars
         .exit()
         .transition()
         .duration(tickDuration)
         .ease(d3.easeLinear)
         .attr('width', d => x_race(d.value) - x_race(0) - 1)
         .attr('y', d => y_race(top_n + 1) + 5)
         .remove();

      let labels = svg_race.selectAll('.label')
         .data(yearSlice, d => d.name);

      labels
         .enter()
         .append('text')
         .attr('class', 'label')
         .attr('x', d => x_race(d.value) - 8)
         .attr('y', d => y_race(top_n + 1) + 5 + ((y_race(1) - y_race(0)) / 2))
         .style('text-anchor', 'end')
         .html(d => d.name)
         .transition()
         .duration(tickDuration)
         .ease(d3.easeLinear)
         .attr('y', d => y_race(d.rank) + 5 + ((y_race(1) - y_race(0)) / 2) + 1);


      labels
         .transition()
         .duration(tickDuration)
         .ease(d3.easeLinear)
         .attr('x', d => x_race(d.value) - 8)
         .attr('y', d => y_race(d.rank) + 5 + ((y_race(1) - y_race(0)) / 2) + 1);

      labels
         .exit()
         .transition()
         .duration(tickDuration)
         .ease(d3.easeLinear)
         .attr('x', d => x_race(d.value) - 8)
         .attr('y', d => y_race(top_n + 1) + 5)
         .remove();



      let valueLabels = svg_race.selectAll('.valueLabel').data(yearSlice, d => d.name);

      valueLabels
         .enter()
         .append('text')
         .attr('class', 'valueLabel')
         .attr('x', d => x_race(d.value) + 5)
         .attr('y', d => y_race(top_n + 1) + 5)
         .text(d => d3.format(',.0f')(d.lastValue))
         .transition()
         .duration(tickDuration)
         .ease(d3.easeLinear)
         .attr('y', d => y_race(d.rank) + 5 + ((y_race(1) - y_race(0)) / 2) + 1);

      valueLabels
         .transition()
         .duration(tickDuration)
         .ease(d3.easeLinear)
         .attr('x', d => x_race(d.value) + 5)
         .attr('y', d => y_race(d.rank) + 5 + ((y_race(1) - y_race(0)) / 2) + 1)
         .tween("text", function (d) {
            let i = d3.interpolate(d.lastValue, d.value);
            return function (t) {
               if(flag_play){
                  this.textContent = d3.format(',.2f')(i(t));
               }
            };
         });


      valueLabels
         .exit()
         .transition()
         .duration(tickDuration)
         .ease(d3.easeLinear)
         .attr('x', d => x_race(d.value) + 5)
         .attr('y', d => y_race(top_n + 1) + 5)
         .remove();

      yearText.html(~~year);
      if(flag_play){
         if (year == 2020) year = 1990;
         year = d3.format('.1f')((+year) + 1);
      }
      
   }
});

const halo = function (text, strokeWidth) {
   text.select(function () { return this.parentNode.insertBefore(this.cloneNode(true), this); })
      .style('fill', '#ffffff')
      .style('stroke', '#ffffff')
      .style('stroke-width', strokeWidth)
      .style('stroke-linejoin', 'round')
      .style('opacity', 1);

}
