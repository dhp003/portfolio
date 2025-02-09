import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";


const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;


renderProjects(projects, projectsContainer, 'h2');


let query = '';
let selectedIndex = -1;

const searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    if (selectedIndex !== -1) {
        let selectedYear = data[selectedIndex].label; 
        filteredProjects = filteredProjects.filter(p => p.year === selectedYear);
    }

    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});



function renderPieChart(projectsGiven) {

    let newSVG = d3.select("#projects-plot");
    newSVG.selectAll("*").remove();
    let legend = d3.select('.legend');
    legend.html("");


    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));


    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d)); 
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    arcs.forEach((arc, idx) => {
        newSVG.append("path")
            .attr("d", arc)
            .attr("fill", colors(idx))
            .attr("class", "wedge")
            .on("click", function () {
                selectedIndex = selectedIndex === idx ? -1 : idx; 
    
                newSVG.selectAll("path")
                    .attr("class", (_, i) => i === selectedIndex ? "wedge selected" : "wedge");
    
                legend.selectAll("li")
                    .attr("class", (_, i) => i === selectedIndex ? "legend-item selected" : "legend-item");
    
                
                if (selectedIndex === -1) {
                    renderProjects(projects, projectsContainer, 'h2'); // Reset to all projects
                } else {
                    let selectedYear = data[selectedIndex].label; // Get selected year
                    let filteredProjects = projects.filter(p => p.year === selectedYear);
                    renderProjects(filteredProjects, projectsContainer, 'h2');
                }
            });
    });
    

    data.forEach((d, idx) => {
        legend.append('li')
              .attr('class', 'legend-item') 
              .attr('style', `--color:${colors(idx)}`) 
              .html(`
                  <span class="swatch"></span> 
                  ${d.label} <em>(${d.value})</em>
              `);
    });
}

renderPieChart(projects);
