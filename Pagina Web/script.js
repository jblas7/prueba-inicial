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
    }),
    ice: L.icon({
        iconUrl: 'img/hielo.png',
        iconSize: [32, 32]
    }),
    volcan: L.icon({
        iconUrl: 'img/volcan.png',
        iconSize: [32, 32]
    })
};

// por defecto todo activo

let activeFilters = {
    wildfires: true,
    storms: true,
    earthquakes: true,
    ice: true,
    volcanes: true
};

let markers = [];

document.querySelectorAll('.filtro-eventos input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        updateFilters();

        applyFilters();
    });
});

function updateFilters() {
    activeFilters.volcanes = document.getElementById('filtrar-volcanes').checked;
    activeFilters.storms = document.getElementById('filtrar-tormentas').checked;
    activeFilters.ice = document.getElementById('filtrar-icebergs').checked;
    activeFilters.wildfires = document.getElementById('filtrar-incendios').checked;
}

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
        console.log(data);

        clearMarkers();

        data.events.forEach(event => {
            let iconType;
            let category = event.categories[0].title;

            if (category === 'Wildfires') {
                iconType = icons.wildfire;
            } else if (category === 'Severe Storms') {
                iconType = icons.storm;
            } else if (category === 'Earthquakes') {
                iconType = icons.earthquake;
            } else if (category === 'Sea and Lake Ice') {
                iconType = icons.ice;
            } else if (category === 'Volcanoes') {
                iconType = icons.volcan;
            }

            if (iconType && event.geometry.length > 0) {
                let coords = event.geometry[0].coordinates;

                let marker = L.marker([coords[1], coords[0]], { icon: iconType });
                marker.category = category;
                markers.push(marker);

                marker.addTo(map);

                marker.bindPopup(`
                    <strong>${event.title}</strong><br>
                    Categoría: ${category}<br>
                    Fecha de inicio: ${event.geometry[0].date}<br>
                `);

                marker.on('click', function () {
                    document.getElementById('event-details').innerHTML = `
                        <h3>${event.title}</h3>
                        <p><strong>Categoría:</strong> ${category}</p>
                        <p><strong>Fecha de inicio:</strong> ${event.geometry[0].date}</p>
                        <p><strong>Ubicación:</strong> Lat: ${coords[1]}, Lng: ${coords[0]}</p>
                    `;
                });
            }
        });

        applyFilters();

    } catch (error) {
        console.error('Error al obtener los eventos:', error);
    }
}

function clearMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
}

function applyFilters() {
    markers.forEach(marker => {
        let category = marker.category;

        if (
            (category === 'Wildfires' && activeFilters.wildfires) ||
            (category === 'Severe Storms' && activeFilters.storms) ||
            (category === 'Earthquakes' && activeFilters.earthquakes) ||
            (category === 'Sea and Lake Ice' && activeFilters.ice) ||
            (category === 'Volcanoes' && activeFilters.volcanes)
        ) {
            map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    });
}

fetchEvents();