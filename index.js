(function() {
    window.addEventListener('load', init);

    function init() {
        getData();
        createMap();

        //promise to load inthe data first then execute the visualization function for section2
        Promise.all([
            d3.csv('data/time_series_covid19_deaths_global.csv'),
            d3.csv('data/time_series_covid19_recovered_global.csv')])
        .then(processData);

        document.getElementById('deaths').addEventListener('click', () => {toggleMap('deaths')});
        document.getElementById('confirmed').addEventListener('click', () => {toggleMap('confirmed')});
        document.getElementById('recovered').addEventListener('click', () => {toggleMap('recovered')});

        document.getElementById('countries').onchange=function() {
            var selection = this.value;
            prepData(time_data_deaths, time_data_recovered, selection);
        };
    }

    var time_data_deaths;
    var time_data_confirmed;
    var time_data_recovered;

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

        d3.json('countries.geojson').then(data => {
            countryData = data;
            countryData.features.forEach(d => {
                let countryName = d.properties['ADMIN'];
                if (countryName in countries) {
                   d.properties['fillColor'] = deathScale(countries[countryName].deaths);
                }
                else {
                    d.properties['fillColor'] = 'rgba(0, 0, 0, 0)';
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

        mymap.on('click', 'countries-fill', function(d) {
            let countryName = d.features[0].properties['ADMIN'];
            if (countryName in countries) {
                let country = countries[countryName];
                let html = countryName + '<br>' +
                'Total Deaths: ' + country.deaths + '<br>' +
                'Total Recovered: ' + country.recovered + '<br>' +
                'Confrimed Cases: ' + country.confirmed;

                new mapboxgl.Popup()
                    .setLngLat(d.lngLat)
                    .setHTML(html)
                    .addTo(mymap);
            }
        });

        mymap.on('mouseenter', 'countries-fill', function(d) {
            if (d.features[0].properties['fillColor'] !== 'rgba(0, 0, 0, 0)') {
                mymap.getCanvas().style.cursor = 'pointer';
            }
        });

        mymap.on('mouseleave', 'countries-fill', function() {
            mymap.getCanvas().style.cursor = '';
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
               d.properties['fillColor'] = scale(countries[countryName][stat]);
            }
            else {
                d.properties['fillColor'] = 'rgba(0, 0, 0, 0)';
            }
        });
        mymap.getSource('countries-source').setData(countryData);
    }

    function processData(data) {
        time_data_deaths = data[0];
        time_data_recovered = data[1];

        let list = [];

        for(let i = 0; i < time_data_deaths.length; i++) {
            if(list.includes(time_data_deaths[i].Country) == false) {
                list.push(time_data_deaths[i].Country);
            }
        }

        let dropdown = document.getElementById('countries');

        for(var i = 0; i < list.length; i++) {
            let opt = list[i];
            let element = document.createElement("option");
            element.textContent = opt;
            element.value = opt;
            dropdown.appendChild(element);
        }

        prepData(time_data_deaths, time_data_recovered);
    }

    function prepData(death, recovered, country) {
        var deaths = death;
        var recovered = recovered;

        var death_numbers = [];
        var recovered_numbers = [];
        //separate array for dates
        var dates = [];

        //only need to grab the column names from one file
        var column_names = deaths.columns;

        if(country === undefined) {
            country = "US"; //setting default
        }

        let length = deaths.length;

        for(let i = 0; i < length; i++) {
            if(deaths[i].Country == country) {
                //selects the right country

                let j = 4;
                let deaths_obj = deaths[i];
                let recovered_obj = recovered[i];

                for (const instance in deaths_obj) {
                    let date = column_names[j];
                    let d_number = deaths_obj[column_names[j]];
                    let r_number = recovered_obj[column_names[j]];

                    death_numbers.push(d_number);
                    recovered_numbers.push(r_number);
                    dates.push(date);
                    j++
                }
            }
        }

        for(let i = 0; i < death_numbers.length; i++) {
            if(death_numbers[i] === undefined) {
                death_numbers.splice(i);
            }
            if(recovered_numbers[i] === undefined) {
                recovered_numbers.splice(i);
            }
            if(dates[i] === undefined) {
                dates.splice(i);
            }
        }


        if(recovered_numbers.length == 94) {
            recovered_numbers.splice(1, 0, "0");
        }

        death_numbers.splice(0, 0, "deaths");
        recovered_numbers.splice(0, 0, "recovered");

        lineChart(death_numbers, recovered_numbers, dates);

    }

    function lineChart(deaths, recovered, dates) {
        var chart = c3.generate({
            padding: {
                right: 60,
            },
            data: {
                columns: [
                    ['deaths', ...deaths],
                    ['recovered', ...recovered],
                ]
            },
            axis: {
                x: {
                    show: false
                }
            },
            tooltip: {
                format: {
                    title: function(d) {
                        return dates[d];
                    }
                }
            }
        });

        chart.load();
    }
})();
