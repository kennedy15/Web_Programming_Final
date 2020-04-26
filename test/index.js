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
    if(number > 500000) {
        return '#800026';
    }
    else if(number > 350000 && number <= 500000) {
        return '#BD0026';
    }
    else if(number > 150000 && number <= 350000) {
        return '#E31A1C';
    }
    else if(number > 85000 && number <= 150000) {
        return '#FC4E2A';
    }
    else if(number > 25000 && number <= 85000) {
        return '#FD8D3C';
    }
    else if(number > 8500 && number <= 25000) {
        return '#FEB24C';
    }
    else if(number > 950 && number <= 8500) {
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
    if(number > 500000) {
        return '#05668D';
    }
    else if(number > 350000 && number <= 500000) {
        return '#028090';
    }
    else if(number > 150000 && number <= 350000) {
        return '#019493';
    }
    else if(number > 85000 && number <= 150000) {
        return '#00A896';
    }
    else if(number > 25000 && number <= 85000) {
        return '#01B698';
    }
    else if(number > 8500 && number <= 25000) {
        return '#02C39A';
    }
    else if(number > 950 && number <= 8500) {
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
    //console.log(json_Length);

    for(let i = 0; i < json_Length; i++) {
        let tmp = new Country(); // create new Country object for each country
        //let tmp = [];
        let name = c_keys[i] //get the name of the country
        let length = data[name].length; //get the length from inside the country

        let tmp_deaths = 0;
        let tmp_recovered = 0;
        let tmp_confirmed = 0;

        //console.log(test[i]); // <this is how you would get the name of each country as a string
        //console.log(data['Angola']); // <this is how you get to each country

        //console.log(data[name][4]);
        //console.log(data[name][4].deaths);

        for(let i = 0; i < length; i++) {
            tmp_deaths += data[name][i].deaths;
            tmp_recovered += data[name][i].recovered;
            tmp_confirmed += data[name][i].confirmed;
        }

        //fill in the country object with the data!
        tmp.name = name;
        tmp.death = tmp_deaths;
        tmp.confirmed = tmp_confirmed;
        tmp.recovered = tmp_recovered;


        //make an array of arrays instead
        //tmp.push(name, tmp_deaths, tmp_confirmed, tmp_recovered);

        countryArray.push(tmp); //add the new object to an array to keep track
    }

    //countryArray.forEach(state => console.log(state.death)); //debugging
    //console.log(countryArray[0].death);
    //console.log(countryArray[4].death);

}

function load_bar_chart(data) {
    let w = 1400;
    let h = 800;

    let color = 'steelblue'

    var chart = d3.select('#graph_area').append('svg')
            .attr('width', w)
            .attr('height', h)
            .selectAll('rect')
                .data(data)
                .enter().append('rect')
                    .style('fill', color)
                    .attr('width', 15) //15 = barWidth
                    .attr('height', function(d, i){
                        return d[i][1];
                    })
                    .attr('x', function(i){
                        return i * (15 + 5); //barwidth + barOffset
                    })
                    .attr('y', function(d, i){
                        return h - d[i][1];
                    })

}

function load_circular_bar_chart(data) {

    //intialize variables
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        w = 900 - margin.left - margin.right,
        h = 900 - margin.top - margin.bottom,
        innerRadius = 100,
        outerRadius = Math.min(w, h) / 2,
        max = 100000,
        color = 'steelblue';

    //appending svg to the page
    var svg = d3.select('#graph_area')
        .append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
        .append('g')
            .attr('transform', 'translate(' + w / 2 + ',' + (h / 2 + 100)+ ')');

    // X scale
    var x = d3.scaleBand()
        .range([0,2 * Math.PI])
        .align(0)
        .domain(data.map(function(d, i) {
            return d[i].death;
        }) );

    // Y scale
    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius])
        .domain([0, max]);

    svg.append('g')
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
            .attr('fill', color)
            .attr('d', d3.arc()
                .innerRadius(function(d, i) {
                    return y(d[i].death);
                })
                .outerRadius(function(d, i) {
                    return x(d[i].name);
                })
                .endAngle(function(d, i) {
                    return x(d[i].name) + x.bandwidth();
                })
                .padAngle(0.01)
                .padRadius(innerRadius))
}

function load_map() {
    //by default the map will load based on the number of Deaths

    mymap = L.map('map_area').setView([24.505, -0.09], 3);

    //create the map
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
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

function parallel_coordinates(data) {
    var data = data;
    var data_array = [];
    var country_names = [];

    var column_names = data[0].columns;

    console.log(data);
    console.log(column_names);

    //intialize variables
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 900 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom,
        max = 100000,
        color = 'steelblue';

    var svg = d3.select("#graph_area").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

}

function init() {
    get_data();
    console.log(countryArray);

    //loading map for section1
    load_map();

    //promise to load inthe data first then execute the visualization function for section2
    Promise.all([
        d3.csv('data/time_series_covid19_deaths_global.csv')])
    .then(parallel_coordinates);

    //intialize buttons
    document.getElementById('confirmed').onclick = function() {load_map_data('confirmed', mymap)};
    document.getElementById('recovered').onclick = function() {load_map_data('recovered', mymap)};
    document.getElementById('deaths').onclick = function() {load_map_data('death', mymap)};
}



window.onload = init;
