var padding = { top: 20, right: 40, bottom: 0, left: 0 },
    w = 500 - padding.left - padding.right,
    h = 500 - padding.top - padding.bottom,
    r = Math.min(w, h) / 2,
    rotation = 0,
    oldrotation = 0,
    picked = 100000,
    oldpick = [],
    color = d3.scale.category20();

var data = [
    { "label": "Faruk" },
    { "label": "Alma" },
    { "label": "SUZUKI" },
    { "label": "HONDA" },
    { "label": "FERRARI" },
    { "label": "APARTMENT" },

];

var svg = d3.select('#chart')
    .append("svg")
    .data([data])
    .attr("width", w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);
var container = svg.append("g")
    .attr("class", "chartholder")
    .attr("transform", "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")");
var vis = container
    .append("g");

var pie = d3.layout.pie().sort(null).value(function (d) { return 1; });
// declare an arc generator function
var arc = d3.svg.arc().outerRadius(r);
// select paths, use arc generator to draw
var arcs = vis.selectAll("g.slice")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "slice");

// arcs.append("path")
//     .attr("fill", function (d, i) { return color(i); })
//     .attr("d", function (d) { return arc(d); });

// Change the line below to set all slices to yellow
arcs.append("path")
    .attr("fill", "#fcc203") // Set the fill color to yellow
    .attr("d", function (d) { return arc(d); });


// add the text
arcs.append("text").attr("transform", function (d)
{
    d.innerRadius = 0;
    d.outerRadius = r;
    d.angle = (d.startAngle + d.endAngle) / 2;
    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius - 10) + ")";
})
    .attr("text-anchor", "end")
    .text(function (d, i)
    {
        return "?";
    });
container.on("click", spin);

var showModal = function (question)
{
    var modal = document.getElementById("myModal");
    var modalQuestion = document.getElementById("modalQuestion");
    modalQuestion.innerText = question;
    modal.style.display = "block";
};

var closeModal = function ()
{
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
};

// Function to save selected names to a file
function saveToFile(names)
{
    const fileSystem = window.webkitRequestFileSystem || window.requestFileSystem;

    fileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs)
    {
        fs.root.getFile('data/names.txt', { create: true }, function (fileEntry)
        {
            fileEntry.createWriter(function (fileWriter)
            {
                fileWriter.seek(fileWriter.length); // Move the file pointer to the end

                const blob = new Blob([names.join('\n')], { type: 'text/plain' });

                blob.arrayBuffer().then(function (buffer)
                {
                    const view = new Uint8Array(buffer);
                    fileWriter.write(view);
                });
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);
}

function errorHandler(error)
{
    console.error('File system error:', error);
}


var buttonClicked = true;

function spin(d)
{
    if (!buttonClicked)
    {
        // If the button is not clicked, disable spinning
        console.log("Disable");
        return;
    }
    // Play the spin sound
    document.getElementById('spinSound').play();

    container.on("click", null);
    //all slices have been seen, all done
    console.log("OldPick: " + oldpick.length, "Data length: " + data.length);
    if (oldpick.length == data.length)
    {
        console.log("done");
        container.on("click", null);
        return;
    }
    var ps = 360 / data.length,
        pieslice = Math.round(1440 / data.length),
        rng = Math.floor((Math.random() * 1440) + 360);

    rotation = (Math.round(rng / ps) * ps);

    picked = Math.round(data.length - (rotation % 360) / ps);
    picked = picked >= data.length ? (picked % data.length) : picked;
    if (oldpick.indexOf(picked) !== -1)
    {
        d3.select(this).call(spin);
        return;
    } else
    {
        oldpick.push(picked);
    }
    rotation += 90 - Math.round(ps / 2);
    vis.transition()
        .duration(3000)
        .attrTween("transform", rotTween)
        .each("end", function ()
        {
            //mark question as seen
            d3.select(".slice:nth-child(" + (picked + 1) + ") path")
                .attr("fill", "#111");
            //populate question
            // d3.select("#question h1")
            //     .text(data[picked].label);
            // oldrotation = rotation;

            d3.select("h2")
                .text(data[picked].label);
            oldrotation = rotation;


            /* Get the result value from object "data" */
            console.log(data[picked].label)



            /* Comment the below line for restrict spin to sngle time */
            container.on("click", spin);

            buttonClicked = false;

            // Play the spin sound
            var sound = document.getElementById('spinSound');
            sound.pause();

            // Save the selected name to localStorage
            saveToLocalStorage(data[picked].label);
        });
}
//make arrow
svg.append("g")
    .attr("transform", "translate(" + (w + padding.left + padding.right) + "," + ((h / 2) + padding.top) + ")")
    .append("path")
    .attr("d", "M-" + (r * .15) + ",0L0," + (r * .05) + "L0,-" + (r * .05) + "Z")
    .style({ "fill": "black" });
//draw spin circle
container.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 60)
    .style({ "fill": "white", "cursor": "pointer" });
//spin text
container.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("SPIN")
    .style({ "font-weight": "bold", "font-size": "30px" });


function rotTween(to)
{
    var i = d3.interpolate(oldrotation % 360, rotation);
    return function (t)
    {
        return "rotate(" + i(t) + ")";
    };
}


function getRandomNumbers()
{
    var array = new Uint16Array(1000);
    var scale = d3.scale.linear().range([360, 1440]).domain([0, 100000]);
    if (window.hasOwnProperty("crypto") && typeof window.crypto.getRandomValues === "function")
    {
        window.crypto.getRandomValues(array);
        console.log("works");
    } else
    {
        //no support for crypto, get crappy random numbers
        for (var i = 0; i < 1000; i++)
        {
            array[i] = Math.floor(Math.random() * 100000) + 1;
        }
    }
    return array;
}

function enableSpining()
{
    showBtn = document.querySelector(".show-modal");
    showBtn.addEventListener("click", () => { buttonClicked = false; });
}


// Function to save selected names to localStorage
function saveToLocalStorage(name)
{
    // Retrieve existing names from localStorage
    const storedNames = localStorage.getItem('selectedNames');

    // Parse existing names or initialize an empty array
    const namesArray = storedNames ? JSON.parse(storedNames) : [];

    // Add the new name
    namesArray.push(name);

    // Save the updated array back to localStorage
    localStorage.setItem('selectedNames', JSON.stringify(namesArray));
}