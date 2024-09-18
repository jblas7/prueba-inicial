
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

/*var wildfireMarker1 = L.marker([39.4702, -0.3768], { icon: icons.wildfire }).addTo(map);
wildfireMarker1.bindPopup("<strong>Incendio Forestal</strong><br>Valencia, España");

var stormMarker1 = L.marker([46.8182, 8.2275], { icon: icons.storm }).addTo(map);
stormMarker1.bindPopup("<strong>Tormenta Eléctrica</strong><br>Zúrich, Suiza");

var earthquakeMarker1 = L.marker([43.7696, 11.2558], { icon: icons.earthquake }).addTo(map);
earthquakeMarker1.bindPopup("<strong>Terremoto</strong><br>Florencia, Italia");

var wildfireMarker2 = L.marker([39.3999, -8.2245], { icon: icons.wildfire }).addTo(map);
wildfireMarker2.bindPopup("<strong>Incendio Forestal</strong><br>Lisboa, Portugal");

var stormMarker2 = L.marker([48.8566, 2.3522], { icon: icons.storm }).addTo(map);
stormMarker2.bindPopup("<strong>Tormenta Eléctrica</strong><br>París, Francia");

var earthquakeMarker2 = L.marker([37.9838, 23.7275], { icon: icons.earthquake }).addTo(map);
earthquakeMarker2.bindPopup("<strong>Terremoto</strong><br>Atenas, Grecia");

var wildfireMarker3 = L.marker([37.3886, -5.9823], { icon: icons.wildfire }).addTo(map);
wildfireMarker3.bindPopup("<strong>Incendio Forestal</strong><br>Sevilla, España");

var stormMarker3 = L.marker([41.9028, 12.4964], { icon: icons.storm }).addTo(map);
stormMarker3.bindPopup("<strong>Tormenta Eléctrica</strong><br>Roma, Italia");

var earthquakeMarker3 = L.marker([37.9838, 23.7275], { icon: icons.earthquake }).addTo(map);
earthquakeMarker3.bindPopup("<strong>Terremoto</strong><br>Atenas, Grecia");*/

async function fetchEvents() {
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

        if (iconType && event.geometry.length > 0) {
            let coords = event.geometry[0].coordinates;
            
            let marker = L.marker([coords[1], coords[0]], { icon: iconType }).addTo(map);

            marker.bindPopup(`
                <strong>${event.title}</strong><br>
                Categoría: ${event.categories[0].title}<br>
                Fecha de inicio: ${event.geometry[0].date}<br>
            `);

            marker.on('click', function() {
                document.getElementById('event-details').innerHTML = `
                    <h3>${event.title}</h3>
                    <p><strong>Categoría:</strong> ${event.categories[0].title}</p>
                    <p><strong>Fecha de inicio:</strong> ${event.geometry[0].date}</p>
                    <p><strong>Ubicación:</strong> Lat: ${coords[1]}, Lng: ${coords[0]}</p>
                `;
            });
        }
    });
}

fetchEvents();
