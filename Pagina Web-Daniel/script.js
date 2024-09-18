
var map = L.map('map').setView([0, 0], 2); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

var icons = {
    wildfire: L.icon({
        iconUrl: 'img/incendio.png',  
        iconSize: [32, 32]
    }),
    storm: L.icon({
        iconUrl: 'img/tormenta-electrica.png',
        iconSize: [32, 32]
    }),
    earthquake: L.icon({
        iconUrl: 'img/terremoto.png', 
        iconSize: [32, 32]
    })
};

var wildfireMarker = L.marker([20, -100], { icon: icons.wildfire }).addTo(map);
wildfireMarker.bindPopup("<strong>Incendio Forestal</strong>");

var stormMarker = L.marker([40, -80], { icon: icons.storm }).addTo(map);
stormMarker.bindPopup("<strong>Tormenta Eléctrica</strong>");

var earthquakeMarker = L.marker([10, 60], { icon: icons.earthquake }).addTo(map);
earthquakeMarker.bindPopup("<strong>Terremoto</strong>");

/*async function fetchEvents() {
    const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open');
    const data = await response.json();
    console.log(data);


    data.events.forEach(event => {
        let iconType;

        if (event.categories[0].title === 'Wildfires') {
            iconType = icons.wildfire;
        } else if (event.categories[0].title === 'Severe Storms') {
            iconType = icons.storm;
        } else if (event.categories[0].title === 'Earthquakes') {
            iconType = icons.earthquake;
        } else {
            iconType = null;
        }

        if (iconType && event.geometries.length > 0) {
            let coords = event.geometries[0].coordinates;
            
            let marker = L.marker([coords[1], coords[0]], { icon: iconType }).addTo(map);

            marker.bindPopup(`
                <strong>${event.title}</strong><br>
                Categoría: ${event.categories[0].title}<br>
                Fecha de inicio: ${event.geometries[0].date}<br>
            `);

            marker.on('click', function() {
                document.getElementById('event-details').innerHTML = `
                    <h3>${event.title}</h3>
                    <p><strong>Categoría:</strong> ${event.categories[0].title}</p>
                    <p><strong>Fecha de inicio:</strong> ${event.geometries[0].date}</p>
                    <p><strong>Ubicación:</strong> Lat: ${coords[1]}, Lng: ${coords[0]}</p>
                `;
            });
        }
    });
}*/

fetchEvents();
