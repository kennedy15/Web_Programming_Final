function Country(name, death, recovered, confirmed) {
    this.name = name;
    this.death = death;
    this.recovered = recovered;
    this.confirmed = confirmed;
}

var countryArray = []; //array of country objects
function getColorDeaths(d) {
    return d > 500000 ? '#800026' :
            d > 350000  ? '#BD0026' :
            d > 150000  ? '#E31A1C' :
            d > 85000  ? '#FC4E2A' :
            d > 25000   ? '#FD8D3C' :
            d > 8500   ? '#FEB24C' :
            d > 950   ? '#FED976' :
                        '#FFEDA0';
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
    var mymap = L.map('map_area').setView([24.505, -0.09], 3);

    //create the map
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoia2VubmVkeTE1IiwiYSI6ImNqdWlnZmNrNTFhNWo0M3Vqd2s1d3M4dWkifQ.kXdDtWHyleWospgGzCmwIg'
    }).addTo(mymap);

    $.getJSON("countries.geojson",function(data){
        // add GeoJSON layer to the map once the file is loaded
        var datalayer = L.geoJson(data ,{
            onEachFeature: function(feature, featureLayer) {
                //set the name from the feature to a variable to use
                let name = feature.properties.ADMIN;
                //bind the name to a popup we can also bind the statistics to this later
                featureLayer.bindPopup(name);
                //find the data for the country in the countryArray
                for(let i = 0; i < countryArray.length; i++) {
                    if(name = countryArray[i].name) {
                        //set the color based on the total number of deaths / recovered / confirmed-cases
                        featureLayer.setStyle({fillColor : getColorDeaths(countryArray[i].death)})
                    }
                }
            }
        }).addTo(mymap);
        mymap.fitBounds(datalayer.getBounds());
    });
}

function init() {
    get_data();
    console.log(countryArray);

    load_circular_bar_chart(countryArray);

    //console.log(countryArray);

    //load_bar_chart(countryArray);

    //loading map
    load_map();

}



window.onload = init;
