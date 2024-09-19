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

document.getElementById('date-filter-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (startDate && endDate) {
        await fetchEvents(startDate, endDate);
    }
});

async function fetchEvents(startDate, endDate) {
    try {
        const response = await fetch(`https://eonet.gsfc.nasa.gov/api/v3/events?status=open&start=${startDate}&end=${endDate}`);
        const data = await response.json();

        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

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

                marker.on('click', function () {
                    document.getElementById('event-details').innerHTML = `
                        <h3>${event.title}</h3>
                        <p><strong>Categoría:</strong> ${event.categories[0].title}</p>
                        <p><strong>Fecha de inicio:</strong> ${event.geometry[0].date}</p>
                        <p><strong>Ubicación:</strong> Lat: ${coords[1]}, Lng: ${coords[0]}</p>
                    `;
                });
            }
        });
    } catch (error) {
        console.error('Error al obtener los eventos:', error);
    }
}

fetchEvents(); 
