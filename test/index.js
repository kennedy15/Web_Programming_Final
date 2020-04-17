
function init() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2VubmVkeTE1IiwiYSI6ImNqdWlnZmNrNTFhNWo0M3Vqd2s1d3M4dWkifQ.kXdDtWHyleWospgGzCmwIg';
    var map = new mapboxgl.Map({
        container: 'map_area',
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [4.899, 52.372],
        zoom: 2,
    });

    map.scrollZoom.disable();

    function getColor(d) {
        return d > 1000 ? '#800026' :
                d > 500  ? '#BD0026' :
                d > 200  ? '#E31A1C' :
                d > 100  ? '#FC4E2A' :
                d > 50   ? '#FD8D3C' :
                d > 20   ? '#FEB24C' :
                d > 10   ? '#FED976' :
                            '#FFEDA0';
    }
}




window.onload = init;
