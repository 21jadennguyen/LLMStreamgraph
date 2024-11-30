import React, { Component } from "react";
import * as d3 from "d3";

class Child1 extends Component {
  state = { 
    prevColor: "lightgray"    
  };

  componentDidMount() {
    console.log(this.props.csv_data) // Use this data as default. When the user will upload data this props will provide you the updated data
    this.renderChart();
  }

  componentDidUpdate() {
    console.log(this.props.csv_data)
    this.renderChart();
  }

  renderChart() {
    const data = this.props.csv_data;

    var colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
    var keys = ["GPT-4", "Gemini", "PaLM-2",	"Claude", "LLaMA-3.1"]

    data.forEach(d => {
      d.month = d.Date.getMonth();
    });
    const maxSum = d3.sum(keys.map(key => d3.max(data, d => d[key])));

    var xScale = d3.scaleTime().domain(d3.extent(data, d => d.month)).range([50, 350]);
    var yScale = d3.scaleLinear().domain([0, maxSum]).range([400, 0]);

    var stack = d3.stack().keys(keys).offset(d3.stackOffsetWiggle);
    var stackedSeries = stack(data);

    var areaGenerator = d3.area().x(d => xScale(d.data.month)).y0(d => yScale(d[0])).y1(d => yScale(d[1])).curve(d3.curveCardinal);

    const svg = d3.select(".child1 svg");
    d3.select(".container").selectAll("*").remove();

    // graph
    const graph = d3.select(".container").selectAll("path").data(stackedSeries).join("path").style("fill", (d, i) => colors[i]).attr("d", d=>areaGenerator(d));

    // x axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d => d3.timeFormat("%b")(new Date(2024, d, 1)));

    svg
      .selectAll(".x-axis")
      .data([null])
      .join("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0, 475)")
      .call(xAxis);

    // legend
    const legend = svg
      .selectAll(".legend")
      .data([...keys].reverse())
      .join("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(400, ${250 + i * 20})`);

    legend
      .selectAll("rect")
      .data(d => [d])
      .join("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d, i) => colors[keys.indexOf(d)]);

    legend
      .selectAll("text")
      .data(d => [d])
      .join("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(d => d)
      .style("font-size", "12px")
      .attr("fill", "#000");
  
    // Tooltip
    const tooltip = d3.select("body")
      .selectAll(".tooltip")
      .data([null])
      .join(
        enter => enter.append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "#fff")
          .style("border", "1px solid #ccc")
          .style("padding", "10px")
          .style("pointer-events", "none")
          .style("display", "none"),
        update => update,
        exit => exit.remove()
      );

    const miniChartWidth = 300;
    const miniChartHeight = 100;

    graph
      .on("mousemove", (event, d) => {
        tooltip.style("display", "block");
        tooltip.style("left", `${event.pageX + 10}px`);
        tooltip.style("top", `${event.pageY + 10}px`);

        const modelData = data.map(p => ({
          month: p.month,
          value: p[d.key],
        }));

        const xMiniScale = d3
          .scaleBand()
          .domain(modelData.map(p => p.month))
          .range([15, miniChartWidth+15])
          .padding(0.1);

        const yMiniScale = d3
          .scaleLinear()
          .domain([0, d3.max(modelData, p => p.value)])
          .range([miniChartHeight, 0]);

        tooltip.selectAll("*").remove();

        const miniSvg = tooltip
          .append("svg")
          .attr("width", miniChartWidth + 40)
          .attr("height", miniChartHeight + 40);

        const miniChart = miniSvg
          .append("g")
          .attr("transform", "translate(15, 15)");

        // color transition
        miniChart
          .selectAll("rect")
          .data(modelData)
          .join("rect")
          .attr("x", d => xMiniScale(d.month))
          .attr("y", d => yMiniScale(d.value))
          .attr("width", xMiniScale.bandwidth())
          .attr("height", d => miniChartHeight - yMiniScale(d.value))
          .attr("fill", this.state.prevColor)
          .transition()
          .duration(500)
          .attr("fill", colors[keys.indexOf(d.key)])
          .on("end", () => {
            if (colors[keys.indexOf(d.key)] !== this.state.prevColor) {
              this.setState({ prevColor: colors[keys.indexOf(d.key)] });
            }
          });

        console.log(this.state.prevColor)

        // axes
        const xAxisMini = d3.axisBottom(xMiniScale).tickFormat(d => d3.timeFormat("%b")(new Date(2024, d, 1)));
        const yAxisMini = d3.axisLeft(yMiniScale).ticks(5);

        miniChart.append("g").attr("transform", `translate(0, ${miniChartHeight})`).call(xAxisMini);
        miniChart.append("g").attr("transform", "translate(15, 0)").call(yAxisMini);
      })
      .on("mouseout", (event, d) => {
        console.log("out")
        tooltip.style("display", "none");
        this.setState({ prevColor: colors[keys.indexOf(d.key)]});
      });
  }

  render() {
    return (
      <div className="child1">
        <svg style={{ width: 600, height: 600 }}>
          <g className="container"></g>
        </svg>
      </div>
    );
  }
}

export default Child1;
