// Text DOM
//-------------------------------------------------------
var age_impact_text = d3.select("#age-impact");
var poverty_impact_text = d3.select("#poverty-impact");
var income_impact_text = d3.select("#income-impact");

var xAxisValue = d3.select("#x-axis-value");

// Set up SVG and Chart group
//-------------------------------------------------------
// Define SVG area dimensions
var svgWidth = 640;
var svgHeight = 560;

// Define the chart's margins as an object
var margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 80
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "age";
var chosenYAxis = "smokes";
xAxisValue.text(chosenXAxis);

// X and Y Axis Dynamical Generator
//-------------------------------------------------------
function xScale(healthData,chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
            d3.max(healthData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0,chartWidth]);
    return xLinearScale;
}

function yScale(healthData,chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
            d3.max(healthData, d => d[chosenYAxis]) * 1.2
        ])
        .range([chartHeight,0]);
    return yLinearScale;
}

function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);  
    return xAxis;
}
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);  
    return yAxis;
};

// Function to update circles group 
//-------------------------------------------------------   
function renderCircles_X(circlesGroup,newXScale,chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
};

function renderCircles_Y(circlesGroup,newYScale,chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
};

// Function to update tool tips
//-------------------------------------------------------  
function updateToolTip(chosenXAxis,chosenYAxis,circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xLabel = "In Poverty (%)";
    }
    else if (chosenXAxis === "age") {
        var xLabel = "Age (Median)";
    }
    else {
        var xLabel = "Household Income (Median)";
    }

    if (chosenYAxis === "obesity") {
        var yLabel = "Obese (%)";
    }
    else if (chosenYAxis === "smokes") {
        var yLabel = "Smokes (%)";
    }
    else {
        var yLabel = "Lacks Healthcare (%)";
    }

    var toolTip = d3.tip()
        .attr('class','d3-tip')
        .offset([80,-60])
        .html(d => {
        let content = `<div class="stateText">${d.state}</div>`;
        content += `<div class="tip-x">${xLabel}: ${d[chosenXAxis]}</div>`;
        content += `<div class="tip-y">${yLabel}: ${d[chosenYAxis]}</div>`;
        return content;
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover",toolTip.show).on("mouseout",toolTip.hide);

    return circlesGroup;
};


// Read in Data and Plot
//-------------------------------------------------------
d3.csv("assets/data/data.csv").then(function(healthData) {
    // Throw an error if one occurs

    // Update data format for six sets of data
    healthData.forEach(function(data) {
        data.age = +data.age;
        data.poverty = +data.poverty;
        data.income = +data.income;
        data.obesity = +data.obesity
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    // Y and X Scale
    var xLinearScale = xScale(healthData,chosenXAxis);
    var yLinearScale = yScale(healthData,chosenYAxis);

    // var y = d3.scaleLinear().range([chartHeight,0]);
    // var x = d3.scaleLinear().range([0,chartWidth]);

    // Bottom and Left Axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
        .classed("axis", true)
        .call(leftAxis);
    
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle").data(healthData)
        .enter()
        .append("circle")
        .attr("cx",d => xLinearScale(d[chosenXAxis]))
        .attr("cy",d => yLinearScale(d[chosenYAxis]))
        .attr("r","10")
        .attr("fill","lightblue")
        .attr("opacity",".7");


    // Create group for 3 x-axis, 3 y-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform",`translate(${chartWidth/2},${chartHeight+margin.top-10})`);

    var ageLabel = xLabelsGroup.append("text").attr("x",0).attr("y",20).attr("value","age").classed("active x-axis",true).text("Age (Median)");
    var povertyLabel = xLabelsGroup.append("text").attr("x",0).attr("y",40).attr("value","poverty").classed("inactive x-axis",true).text("In Poverty (%)");
    var incomeLabel = xLabelsGroup.append("text").attr("x",0).attr("y",60).attr("value","income").classed("inactive x-axis",true).text("Household Income (Median)");

    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
        .attr("y", 0  - margin.left)
        .attr("x",0 - (chartHeight / 2));

    var smokesLabel = yLabelsGroup.append("text").attr("x",-200).attr("y",-25).attr("value","smokes").classed("active y-axis",true).text("Smokes (%)");
    var obesityLabel = yLabelsGroup.append("text").attr("x",-200).attr("y",-45).attr("value","obesity").classed("inactive y-axis",true).text("Obese (%)");
    var healthcareLabel = yLabelsGroup.append("text").attr("x",-200).attr("y",-65).attr("value","healthcare").classed("inactive y-axis",true).text("Lacks Healthcare (%)");

    // Update Tooltip 
    var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);

    xLabelsGroup.selectAll("text")
        .on("click", function() {

            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                chosenXAxis = value;

                xLinearScale = xScale(healthData,chosenXAxis);

                xAxis = renderXAxis(xLinearScale,xAxis);

                circlesGroup = renderCircles_X(circlesGroup, xLinearScale, chosenXAxis);

                circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);

                xAxisValue.text(chosenXAxis);

                // Update the label "active" versus "inactive". 
                if (chosenXAxis === "age") {
                    ageLabel.classed("active",true).classed("inactive",false);
                    povertyLabel.classed("active",false).classed("inactive",true);
                    incomeLabel.classed("active",false).classed("inactive",true);
                    age_impact_text.classed("show",true).classed("hide",false);
                    poverty_impact_text.classed("show",false).classed("hide",true);
                    income_impact_text.classed("show",false).classed("hide",true);
                } else if (chosenXAxis === "poverty") {
                    ageLabel.classed("active",false).classed("inactive",true);
                    povertyLabel.classed("active",true).classed("inactive",false);
                    incomeLabel.classed("active",false).classed("inactive",true);
                    age_impact_text.classed("show",false).classed("hide",true);
                    poverty_impact_text.classed("show",true).classed("hide",false);
                    income_impact_text.classed("show",false).classed("hide",true);
                } else {
                    ageLabel.classed("active",false).classed("inactive",true);
                    povertyLabel.classed("active",false).classed("inactive",true);
                    incomeLabel.classed("active",true).classed("inactive",false);
                    age_impact_text.classed("show",false).classed("hide",true);
                    poverty_impact_text.classed("show",false).classed("hide",true);
                    income_impact_text.classed("show",true).classed("hide",false);
                }
            }
        });

        yLabelsGroup.selectAll("text")
        .on("click", function() {

            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                chosenYAxis = value;

                yLinearScale = yScale(healthData,chosenYAxis);

                yAxis = renderYAxis(yLinearScale,yAxis);

                circlesGroup = renderCircles_Y(circlesGroup, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);

                // Update the label "active" versus "inactive". 
                if (chosenYAxis === "smokes") {
                    smokesLabel.classed("active",true).classed("inactive",false);
                    obesityLabel.classed("active",false).classed("inactive",true);
                    healthcareLabel.classed("active",false).classed("inactive",true);
                } else if (chosenYAxis === "obesity") {
                    smokesLabel.classed("active",false).classed("inactive",true);
                    obesityLabel.classed("active",true).classed("inactive",false);
                    healthcareLabel.classed("active",false).classed("inactive",true);
                } else {
                    smokesLabel.classed("active",false).classed("inactive",true);
                    obesityLabel.classed("active",false).classed("inactive",true);
                    healthcareLabel.classed("active",true).classed("inactive",false);
                }
            }
        });

});
