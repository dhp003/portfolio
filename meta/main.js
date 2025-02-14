import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let data = [];
let commits = [];
let xScale, yScale;

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: +row.line,
        depth: +row.depth,
        length: +row.length,
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime)
    }));

    processCommits();
    displayStats();
    createScatterplot(); 
}

function processCommits() {
    commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;

        let ret = {
            id: commit,
            url: 'https://github.com/dhp003/portfolio/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            totalLines: lines.length
        };

        Object.defineProperty(ret, 'lines', {
            value: lines,
            writable: false,
            enumerable: false,
            configurable: false
        });

        return ret;
    });
}

function displayStats() {
    const totalLOC = data.length;
    const totalCommits = commits.length;
    const numFiles = d3.group(data, (d) => d.file).size;
    const maxDepth = d3.max(data, (d) => d.depth);
    const longestLine = d3.max(data, (d) => d.length);

    const statsContainer = d3.select('#stats').append('dl').attr('class', 'stats');

    statsContainer.append('dt').text('Total LOC');
    statsContainer.append('dd').text(totalLOC);

    statsContainer.append('dt').text('Total Commits');
    statsContainer.append('dd').text(totalCommits);

    statsContainer.append('dt').text('Files');
    statsContainer.append('dd').text(numFiles);

    statsContainer.append('dt').text('Max Depth');
    statsContainer.append('dd').text(maxDepth);

    statsContainer.append('dt').text('Longest Line');
    statsContainer.append('dd').text(longestLine);
}

document.addEventListener('DOMContentLoaded', loadData);

function updateTooltipContent(commit) {
    const link = document.getElementById("commit-link");
    const date = document.getElementById("commit-date");
    const time = document.getElementById("commit-time");
    const author = document.getElementById("commit-author");
    const lines = document.getElementById("commit-lines");

    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString("en", { dateStyle: "full" });
    time.textContent = commit.datetime?.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.style.left = `${event.clientX + 10}px`;  
    tooltip.style.top = `${event.clientY + 10}px`;
}

function createScatterplot() {
    console.log("Creating scatterplot...");

    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 100, bottom: 30, left: 50 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    const svg = d3.select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

     xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

     yScale = d3.scaleLinear()
        .domain([0, 24]) 
        .range([usableArea.bottom, usableArea.top]);

    const colorScale = d3.scaleSequential()
        .domain([0, 24])  
        .interpolator(d3.interpolateWarm);


    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

    const rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])
        .range([3, 20]); 


    brush = d3.brush()
        .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]]) // Only allow brushing inside scatterplot area
        .on("start brush end", brushed); 
    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    console.log("Brush initialized!"); 

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    const dots = svg.append('g').attr('class', 'dots');

    dots
      .selectAll("circle")
      .data(sortedCommits) 
      .join("circle")
      .attr("cx", (d) => xScale(d.datetime))
      .attr("cy", (d) => yScale(d.hourFrac))
      .attr("r", (d) => rScale(d.totalLines)) 
      .attr("fill", (d) => colorScale(d.hourFrac))
      .style("fill-opacity", 0.7)
      .on("mouseenter", function (event, commit) {
        d3.select(event.currentTarget).style("fill-opacity", 1); 
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on("mousemove", updateTooltipPosition)
      .on("mouseleave", function () {
        d3.select(event.currentTarget).style("fill-opacity", 0.7);
        updateTooltipContent({});
        updateTooltipVisibility(false);
      });


    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00'); 

    svg.append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    svg.append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    const gridlines = svg.append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    const legend = svg.append("g")
        .attr("transform", `translate(${usableArea.right + 30}, ${usableArea.top + height / 2 - 50})`);

    const legendScale = d3.scaleLinear().domain([0, 24]).range([0, 100]);

    legend.selectAll("rect")
        .data(d3.range(0, 25, 1)) 
        .join("rect")
        .attr("x", 0)
        .attr("y", (d) => legendScale(d))
        .attr("width", 20)
        .attr("height", 5)
        .attr("fill", (d) => colorScale(d));

    legend.append("text").attr("x", 30).attr("y", legendScale(0)).text("Midnight").attr("font-size", "10px");
    legend.append("text").attr("x", 30).attr("y", legendScale(12)).text("Noon").attr("font-size", "10px");
    legend.append("text").attr("x", 30).attr("y", legendScale(24)).text("Midnight").attr("font-size", "10px");
}

let brush;  
let brushSelection = null;


function brushed(event) {
    if (!event.selection) {
        brushSelection = null;
        updateSelection();
        updateLanguageBreakdown();
        return;
    }
    brushSelection = event.selection;
    console.log("Brush Selection:", brushSelection);
    updateSelection();
    updateLanguageBreakdown(); 
}



function isCommitSelected(commit) {
    if (!brushSelection) return false;

    const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] };

    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac); 

    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}


function updateSelection() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];


    d3.selectAll("circle") 
      .classed("selected", (d) => isCommitSelected(d));


    const countElement = document.getElementById("selection-count");
    countElement.textContent = `${
        selectedCommits.length || "No"
    } commits selected`;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  

    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  

    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
  }



