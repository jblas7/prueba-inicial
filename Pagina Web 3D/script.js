Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZjllM2E5YS1hYTNlLTQwZDctOGU3Ni1mZDZhZWQ5NjY4OGEiLCJpZCI6MjQ0MjkwLCJpYXQiOjE3MjczNDMxNTN9.an12wQjRm9WTN2Ww4ttqUzn-OG1-x4folmwVt7yaHBQ';

// Inicializar el mapa 3D de CesiumJS
var viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain(),
    imageryProvider: new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/'
    }),
    animation: false,
    baseLayerPicker: true,
    fullscreenButton: false,
    homeButton: false,
    infoBox: true,
    sceneModePicker: false,
    timeline: false
});

// Iconos personalizados para diferentes eventos
var icons = {
    wildfire: 'img/incendio.png',
    storm: 'img/tormenta-electrica.png',
    ice: 'img/hielo.png',
    volcan: 'img/volcan.png'
};

// Función para agregar eventos al mapa 3D de Cesium
function addEventToCesium(event, iconUrl) {
    if (event.geometry.length > 0) {
        let coords = event.geometry[0].coordinates;
        viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(coords[0], coords[1]),
            billboard: {
                image: iconUrl,
                width: 32,
                height: 32
            },
            description: `
                <h3>${event.title}</h3>
                <p><strong>Categoría:</strong> ${event.categories[0].title}</p>
                <p><strong>Fecha de inicio:</strong> ${formatDate(event.geometry[0].date)}</p>
                <p><strong>Ubicación:</strong> Lat: ${coords[1]}, Lng: ${coords[0]}</p>
            `
        });
    }
}

// Obtener eventos desde la API de EONET
async function fetchEvents(startDate = '', endDate = '') {
    let url = `https://eonet.gsfc.nasa.gov/api/v3/events?status=open`;
    if (startDate && endDate) {
        url += `&start=${startDate}&end=${endDate}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    data.events.forEach(event => {
        let iconUrl;
        if (event.categories[0].title === 'Wildfires') {
            iconUrl = icons.wildfire;
        } else if (event.categories[0].title === 'Severe Storms') {
            iconUrl = icons.storm;
        } else if (event.categories[0].title === 'Sea and Lake Ice') {
            iconUrl = icons.ice;
        } else if (event.categories[0].title === 'Volcanoes') {
            iconUrl = icons.volcan;
        }

        // Añadir el evento al mapa 3D de Cesium
        addEventToCesium(event, iconUrl);
    });
}

// Manejar filtros por fecha
document.getElementById('date-filter-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (new Date(startDate) > new Date(endDate)) {
        alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
        return;
    }

    if (startDate && endDate) {
        await fetchEvents(startDate, endDate);
    }
});

// Inicializar la carga de eventos
fetchEvents();
