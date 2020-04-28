(function() {
    window.addEventListener('load', init);

    function init() {
        getData();

        //loading map for section1
        // loadMap();
        createMap();

        //promise to load inthe data first then execute the visualization function for section2
        Promise.all([
            d3.csv('data/time_series_covid19_deaths_global.csv')])
        .then(lineChart);

        document.getElementById('deaths').addEventListener('click', () => {toggleMap('deaths')});
        document.getElementById('confirmed').addEventListener('click', () => {toggleMap('confirmed')});
        document.getElementById('recovered').addEventListener('click', () => {toggleMap('recovered')});
    }

    //Country Object
    function Country(name, death, recovered, confirmed) {
        this.name = name;
        this.death = death;
        this.recovered = recovered;
        this.confirmed = confirmed;
    }

    let countries = {};
    let countryData = null;
    var mymap;

    let deathScale = d3.scaleThreshold()
        .domain([450, 1000, 4000, 7000, 10000, 20000, 35000])
        .range([
            '#ffeda0',
            '#fed976',
            '#feb24c',
            '#fd8d3c',
            '#fc4e2a',
            '#e31a1c',
            '#bd0026',
            '#800026',
        ]);

    let confirmedScale = d3.scaleThreshold()
        .domain([950, 8500, 25000, 85000, 150000, 350000, 500000])
        .range([
            '#ffa600',
            '#ff7c43',
            '#f95d6a',
            '#d45087',
            '#a05195',
            '#665191',
            '#2f4b7c',
            '#003f5c',
        ]);

    let recoveredScale = d3.scaleThreshold()
        .domain([1000, 10000, 40000, 55000, 70000, 85000, 100000])
        .range([
            '#f0f3bc',
            '#79dbac',
            '#02c39a',
            '#01b698',
            '#00a896',
            '#019493',
            '#028090',
            '#05668d',
        ]);

    //fecthes data from the source and calls load_country_data on the json file
    function getData() {
        fetch("https://pomber.github.io/covid19/timeseries.json")
            .then(response => response.json())
            .then(data => {
                //console.log(data); //will print the json object
                loadCountryData(data);
            })
            .catch(err => console.error(err));
    }

    //creates a Country object from each key in the json data fetched and appends the object to an array.
    function loadCountryData(data) {
        Object.keys(data).forEach(countryName => {
            const {date, ...country} = data[countryName][data[countryName].length - 1];
            countries[countryName] = country;
        });
    }

    function createMap() {
        let center = [24.505, -0.090];
        mapboxgl.accessToken = 'pk.eyJ1IjoiamFnb2R3aW4iLCJhIjoiY2lnOGQxaDhiMDZzMXZkbHYzZmN4ZzdsYiJ9.Uwh_L37P-qUoeC-MBSDteA';
        mymap = new mapboxgl.Map({
            container: 'map_area',
            center,
            zoom: 2,
            style: 'mapbox://styles/mapbox/dark-v10',
        });
        mymap.dragRotate.disable();
        mymap.touchZoomRotate.disable();

        let canvas = mymap.getCanvasContainer();
        let svg = d3.select(canvas).append('svg');

        d3.json('countries.geojson').then(data => {
            countryData = data;
            countryData.features.forEach(d => {
                let countryName = d.properties['ADMIN'];
                if (countryName in countries) {
                   d.properties['fillColor'] = deathScale(countries[countryName].deaths);
                }
                else {
                    d.properties['fillColor'] = '#000000';
                }
            });

            mymap.addSource('countries-source', {
                'type': 'geojson',
                'data': countryData
            });

            mymap.addLayer({
                'id': 'countries-fill',
                'type': 'fill',
                'source': 'countries-source',
                'paint': {
                    'fill-color': ['get', 'fillColor'],
                    'fill-opacity': 0.8,
                }
            });

            mymap.addLayer({
                'id': 'countries-boundary',
                'type': 'line',
                'source': 'countries-source',
                'paint': {
                    'line-color': 'rgb(0, 0, 0)'
                }
            });
        });
    }

    function toggleMap(stat) {
        let scale = null;
        switch (stat) {
            case 'deaths':
                scale = deathScale;
                break;
            case 'confirmed':
                scale = confirmedScale;
                break;
            case 'recovered':
                scale = recoveredScale;
                break;
        }

        countryData.features.forEach(d => {
            let countryName = d.properties['ADMIN'];
            if (countryName in countries) {
               d.properties['fillColor'] = scale(countries[countryName].deaths);
            }
            else {
                d.properties['fillColor'] = '#000000';
            }
        });
        mymap.getSource('countries-source').setData(countryData);
    }

    function loadMap() {
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

        loadMapData('death', mymap)
    }

    function loadMapData(stat, mymap) {
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
                                color = recoveredScale(countryArray[i].recovered);
                                featureLayer.setStyle({fillColor : color});
                                //binding statistics to the country as a popup!
                                featureLayer.bindPopup('Name: ' + countryArray[i].name + '<br>' + 'total Deaths: ' + countryArray[i].death + '<br>' + 'total Recovered: ' + countryArray[i].recovered + '<br>' + 'total Confirmed Cases: ' + countryArray[i].confirmed);
                            }
                            else if(stat == 'confirmed') {
                                color = confirmedScale(countryArray[i].confirmed);
                                featureLayer.setStyle({fillColor : color});
                                //binding statistics to the country as a popup!
                                featureLayer.bindPopup('Name: ' + countryArray[i].name + '<br>' + 'total Deaths: ' + countryArray[i].death + '<br>' + 'total Recovered: ' + countryArray[i].recovered + '<br>' + 'total Confirmed Cases: ' + countryArray[i].confirmed);
                            }
                            else {
                                color = deathScale(countryArray[i].death);
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

    function lineChart(data) {

        var data = data;
        var data_array = [];
        var country_names = [];

        var column_names = data[0].columns;

        // console.log(data);
        // console.log(column_names);

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

        createLine(svg, data, column_names, x, y); //function that draws the line

    }

    function createLine(svg, data, column_names, x, y, country) {
        var country_data;

        if(country === undefined) {
            country = "US"; //setting default
            // console.log(country);
        }

        let length = data[0].length;

        for(let i = 0; i < length; i++) {
            if(data[0][i].Country == country) {
                //selects the right country
                country_data = data[0][i];
            }
        }

        // console.log(country_data);

        for (let i = 4; i < country_data.length; i++) {
            d.date = parseTime(column_names[i]);
            d.death = +d.column_names[i];
        }


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
})();
