var mapa = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(mapa);

var icons = {
    incendio: L.icon({
        iconUrl: 'img/incendio.png',
        iconSize: [32, 32]
    }),
    tormenta: L.icon({
        iconUrl: 'img/tormenta-electrica.png',
        iconSize: [32, 32]
    }),
    volcan: L.icon({
        iconUrl: 'img/volcan.png',
        iconSize: [32, 32]
    }),
    iceberg: L.icon({
        iconUrl: 'img/hielo.png',
        iconSize: [32, 32]
    })
};

document.getElementById('date-filter-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const fechaInicio = document.getElementById('start-date').value;
    const fechaFin = document.getElementById('end-date').value;

    if (startDate && fechaFin) {
        await fetchEvents(fechaInicio, fechaFin);
    }
});

async function fetchEvents(fechaInicio, fechaFin) {

        const solicitudjson = await fetch(`https://eonet.gsfc.nasa.gov/api/v3/events?status=open&start=${fechaInicio}&end=${fechaFin}`);
        const info = await solicitudjson.json();

        mapa.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapa.removeLayer(layer);
            }
        });

        info.events.forEach(event => {
            let iconType;

            if (event.categories[0].title === 'Wildfires') {
                iconType = icons.incendio;
            } else if (event.categories[0].title === 'Severe Storms') {
                iconType = icons.tormenta;
            } else if (event.categories[0].title === 'Sea and Lake Ice') {
                iconType = icons.iceberg;
            } else if (event.categories[0].title === 'Volcanoes') {
                iconType = icons.volcan;
            }      
            else {
                iconType = null;
            }

            if (iconType && event.geometry.length > 0) {
                let coords = event.geometry[0].coordinates;

                let marker = L.marker([coords[1], coords[0]], { icon: iconType }).addTo(mapa);

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

}

fetchEvents(); 
