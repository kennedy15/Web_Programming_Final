function Country(name, death, recovered, confirmed) {
    this.name = name;
    this.death = death;
    this.recovered = recovered;
    this.confirmed = confirmed;
}

var countryArray = []; //array of country objects

function init() {
    /*
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2VubmVkeTE1IiwiYSI6ImNqdWlnZmNrNTFhNWo0M3Vqd2s1d3M4dWkifQ.kXdDtWHyleWospgGzCmwIg';
    var map = new mapboxgl.Map({
        container: 'map_area',
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [4.899, 52.372],
        zoom: 2,
    });

    map.scrollZoom.disable();
    */

    get_data();

    console.log(countryArray);

}

function getColorDeaths(d) {
    return d > 1000 ? '#800026' :
            d > 500  ? '#BD0026' :
            d > 200  ? '#E31A1C' :
            d > 100  ? '#FC4E2A' :
            d > 50   ? '#FD8D3C' :
            d > 20   ? '#FEB24C' :
            d > 10   ? '#FED976' :
                        '#FFEDA0';
}

//fecthes data from the source and calls load_country_data on the json file
function get_data() {
    fetch("https://pomber.github.io/covid19/timeseries.json")
        .then(response => response.json())
        .then(data => {
            console.log(data);
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

        countryArray.push(tmp); //add the new object to an array to keep track
    }
}



window.onload = init;
