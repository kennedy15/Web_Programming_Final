//Country Object
function Country(name, death, recovered, confirmed) {
    this.name = name;
    this.death = death;
    this.recovered = recovered;
    this.confirmed = confirmed;
}

var countryArray = []; //array of country objects
var mymap;

function getColorDeaths(number) {
    if(number > 35000) {
        return '#800026';
    }
    else if(number > 20000 && number <= 35000) {
        return '#BD0026';
    }
    else if(number > 10000 && number <= 20000) {
        return '#E31A1C';
    }
    else if(number > 7000 && number <= 10000) {
        return '#FC4E2A';
    }
    else if(number > 4000 && number <= 7000) {
        return '#FD8D3C';
    }
    else if(number > 1000 && number <= 4000) {
        return '#FEB24C';
    }
    else if(number > 450 && number <= 1000) {
        return '#FED976';
    }
    else {
        return '#FFEDA0';
    }
}

function getColorConfirmed(number) {
    if(number > 500000) {
        return '#003f5c';
    }
    else if(number > 350000 && number <= 500000) {
        return '#2f4b7c';
    }
    else if(number > 150000 && number <= 350000) {
        return '#665191';
    }
    else if(number > 85000 && number <= 150000) {
        return '#a05195';
    }
    else if(number > 25000 && number <= 85000) {
        return '#d45087';
    }
    else if(number > 8500 && number <= 25000) {
        return '#f95d6a';
    }
    else if(number > 950 && number <= 8500) {
        return '#ff7c43';
    }
    else {
        return '#ffa600';
    }
}

function getColorRecovered(number) {
    if(number > 100000) {
        return '#05668D';
    }
    else if(number > 85000 && number <= 100000) {
        return '#028090';
    }
    else if(number > 70000 && number <= 85000) {
        return '#019493';
    }
    else if(number > 55000 && number <= 70000) {
        return '#00A896';
    }
    else if(number > 40000 && number <= 55000) {
        return '#01B698';
    }
    else if(number > 25000 && number <= 40000) {
        return '#02C39A';
    }
    else if(number > 1000 && number <= 10000) {
        return '#79DBAC';
    }
    else {
        return '#F0F3BD';
    }
}

//fecthes data from the source and calls load_country_data on the json file
function get_data() {
    fetch("https://pomber.github.io/covid19/timeseries.json")
        .then(response => response.json())
        .then(data => {
            //console.log(data); //will print the json object
            load_country_data(data);
        })
        .catch(err => console.error(err));
}

//creates a Country object from each key in the json data fetched and appends the object to an array.
function load_country_data(data) {
    let json_Length = Object.keys(data).length; //amount of countrys
    let c_keys = Object.keys(data); //list of the keys
    //console.log(c_keys);

    for(let i = 0; i < json_Length; i++) {
        let tmp = new Country(); // create new Country object for each country
        let name = c_keys[i] //get the name of the country
        let length = data[name].length; //get the length from inside the country

        let tmp_deaths = 0;
        let tmp_recovered = 0;
        let tmp_confirmed = 0;

        //console.log(test[i]); // <this is how you would get the name of each country as a string
        //console.log(data['Angola']); // <this is how you get to each country

        //console.log(data[name][4]);
        //console.log(data[name][4].deaths);

        //so the json is not reporting daily numbers, its reporting the total number so this for loops is wrong.
        /*
        for(let i = 0; i < length; i++) {
            tmp_deaths += data[name][i].deaths;
            tmp_recovered += data[name][i].recovered;
            tmp_confirmed += data[name][i].confirmed;

            if(name == "US") {
                console.log(tmp_deaths);
                console.log(i);
            }
        }
        */

        //fill in the country object with the data!
        /*
        tmp.name = name;
        tmp.death = tmp_deaths;
        tmp.confirmed = tmp_confirmed;
        tmp.recovered = tmp_recovered;
        */

        //length = the last day which has the most up to date numbers
        tmp.name = name;
        tmp.death = data[name][length-1].deaths;
        tmp.confirmed = data[name][length-1].confirmed;
        tmp.recovered = data[name][length-1].recovered;

        //make an array of arrays instead
        //tmp.push(name, tmp_deaths, tmp_confirmed, tmp_recovered);

        countryArray.push(tmp); //add the new object to an array to keep track
    }

    //countryArray.forEach(state => console.log(state.death)); //debugging
    //console.log(countryArray[0].death);
    //console.log(countryArray[4].death);

}

function load_map() {
    //by default the map will load based on the number of Deaths
    mymap = L.map('map_area', {
        center: [24.505, -0.09],
	    zoom: 5 //this is not work for setting the zoom level :(
    });

    //create the map
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 8,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoia2VubmVkeTE1IiwiYSI6ImNqdWlnZmNrNTFhNWo0M3Vqd2s1d3M4dWkifQ.kXdDtWHyleWospgGzCmwIg'
    }).addTo(mymap);

    load_map_data('death', mymap)
}

function load_map_data(stat, mymap) {
    var stat = stat;

    //checks if there is already a datalayer added to the map
    if(mymap.hasLayer()) {
        //removes it if so
        mymap.removeLayer(datalayer);
    }

    //generates a new datalayer
    $.getJSON("countries.geojson",function(data){
        // add GeoJSON layer to the map once the file is loaded
        let color = '';
        let length = countryArray.length;
        //console.log(length);
        var datalayer = L.geoJson(data ,{
            onEachFeature: function(feature, featureLayer) {
                //set the name from the feature to a variable to use
                let name = feature.properties.ADMIN;

                //find the data for the country in the countryArray
                for(let i = 0; i < length; i++) {
                    if(name == countryArray[i].name) {
                        //console.log(countryArray[i].death)
                        //set the color based on the total number of deaths / recovered / confirmed-cases
                        if(stat == 'recovered') {
                            color = getColorRecovered(countryArray[i].recovered);
                            featureLayer.setStyle({fillColor : color});
                            //binding statistics to the country as a popup!
                            featureLayer.bindPopup('Name: ' + countryArray[i].name + '<br>' + 'total Deaths: ' + countryArray[i].death + '<br>' + 'total Recovered: ' + countryArray[i].recovered + '<br>' + 'total Confirmed Cases: ' + countryArray[i].confirmed);
                        }
                        else if(stat == 'confirmed') {
                            color = getColorConfirmed(countryArray[i].confirmed);
                            featureLayer.setStyle({fillColor : color});
                            //binding statistics to the country as a popup!
                            featureLayer.bindPopup('Name: ' + countryArray[i].name + '<br>' + 'total Deaths: ' + countryArray[i].death + '<br>' + 'total Recovered: ' + countryArray[i].recovered + '<br>' + 'total Confirmed Cases: ' + countryArray[i].confirmed);
                        }
                        else {
                            color = getColorDeaths(countryArray[i].death);
                            featureLayer.setStyle({fillColor : color});
                            //binding statistics to the country as a popup!
                            featureLayer.bindPopup('Name: ' + countryArray[i].name + '<br>' + 'total Deaths: ' + countryArray[i].death + '<br>' + 'total Recovered: ' + countryArray[i].recovered + '<br>' + 'total Confirmed Cases: ' + countryArray[i].confirmed);
                        }

                    }
                }
            }
        }).addTo(mymap);
        mymap.fitBounds(datalayer.getBounds());
    });
}

function line_chart(data) {

    var data = data;
    var data_array = [];
    var country_names = [];

    var column_names = data[0].columns;

    console.log(data);
    console.log(column_names);

    //intialize variables
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        w = 1400 - margin.left - margin.right,
        h = 800 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleTime().range([0, w]);
    var y = d3.scaleLinear().range([h, 0]);

    // append the svg obgect to the body of the page
    var svg = d3.select("#graph_area").append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + h + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    create_line(svg, data, column_names, x, y); //function that draws the line

}

function create_line(svg, data, column_names, x, y, country) {
    var country_data;

    if(country === undefined) {
        country = "US"; //setting default
        console.log(country);
    }

    let length = data[0].length;

    for(let i = 0; i < length; i++) {
        if(data[0][i].Country == country) {
            //selects the right country
            country_data = data[0][i];
        }
    }

    console.log(country_data);

    let i = 4;
    // format the data
    country_data.forEach(function(d) {
        d.date = parseTime(column_names[i]);
        d.death = +d.column_names[i];
        i++
    });


    // Scale the range of the data
    x.domain(d3.extent(country_data, function(d) { return d.date; }));
    y.domain([0, d3.max(country_data, function(d) {
 	    return Math.max(d.death); })]);

    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.death); });


    // Add the valueline path.
    svg.append("path")
        .data([country_data])
        .attr("class", "line")
        .attr("d", valueline);
}

function init() {
    get_data();
    console.log(countryArray);

    //loading map for section1
    load_map();

    //promise to load inthe data first then execute the visualization function for section2
    Promise.all([
        d3.csv('data/time_series_covid19_deaths_global.csv')])
    .then(line_chart);

    //intialize buttons
    document.getElementById('confirmed').onclick = function() {load_map_data('confirmed', mymap)};
    document.getElementById('recovered').onclick = function() {load_map_data('recovered', mymap)};
    document.getElementById('deaths').onclick = function() {load_map_data('death', mymap)};
}



window.onload = init;
