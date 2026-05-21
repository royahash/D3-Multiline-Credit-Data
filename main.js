// Multi-line chart for D3 & SVG comprehension homework.
// Data is loaded from an external CSV file in this folder.
// References used: official D3 documentation for d3.csv, d3.line, d3.scaleTime, and d3.scaleLinear.

const width = 860;
const height = 520;
const margin = { top: 70, right: 145, bottom: 70, left: 70 };

const parseDate = d3.timeParse("%Y-%m-%d");
const formatMonth = d3.timeFormat("%b");

const svg = d3.select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("role", "img")
  .attr("aria-label", "Multi-line chart showing backup power readiness for a school and hospital in 2025.");

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const chart = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("backup_readiness.csv").then(data => {
  data.forEach(d => {
    d.month = parseDate(d.month);
    d.school = +d.school;
    d.hospital = +d.hospital;
  });

  const series = [
    { name: "School", key: "school" },
    { name: "Hospital", key: "hospital" }
  ];

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.month))
    .range([0, chartWidth]);

  const yScale = d3.scaleLinear()
    .domain([50, 100])
    .range([chartHeight, 0]);

  const colorScale = d3.scaleOrdinal()
    .domain(series.map(d => d.name))
    .range(["#2b7cff", "#10a37f"]);

  const lineGenerator = d3.line()
    .x(d => xScale(d.month))
    .y(d => yScale(d.value));

  chart.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yScale).tickSize(-chartWidth).tickFormat(""));

  chart.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(xScale).ticks(d3.timeMonth.every(1)).tickFormat(formatMonth));

  chart.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => `${d}%`));

  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin.left)
    .attr("y", 38)
    .text("Backup power readiness increased across both sites in 2025");

  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", margin.left + chartWidth / 2)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .text("Month");

  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -margin.top - chartHeight / 2)
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .text("Readiness score (%)");

  series.forEach(site => {
    const siteData = data.map(d => ({ month: d.month, value: d[site.key] }));

    chart.append("path")
      .datum(siteData)
      .attr("class", "line")
      .attr("stroke", colorScale(site.name))
      .attr("d", lineGenerator);

    chart.selectAll(`.${site.key}-dot`)
      .data(siteData)
      .join("circle")
      .attr("class", `site-dot ${site.key}-dot`)
      .attr("cx", d => xScale(d.month))
      .attr("cy", d => yScale(d.value))
      .attr("r", 4.5)
      .attr("fill", colorScale(site.name));

    const lastPoint = siteData[siteData.length - 1];

    chart.append("text")
      .attr("class", "line-label")
      .attr("x", xScale(lastPoint.month) + 12)
      .attr("y", yScale(lastPoint.value) + 5)
      .attr("fill", colorScale(site.name))
      .text(`${site.name}: ${lastPoint.value}%`);
  });
});
