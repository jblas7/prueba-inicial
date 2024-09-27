Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZjllM2E5YS1hYTNlLTQwZDctOGU3Ni1mZDZhZWQ5NjY4OGEiLCJpZCI6MjQ0MjkwLCJpYXQiOjE3MjczNDMxNTN9.an12wQjRm9WTN2Ww4ttqUzn-OG1-x4folmwVt7yaHBQ';
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
    timeline: false,
    willReadFrequently: true
});

var icons = {
    wildfire: 'img/incendio.png',
    storm: 'img/tormenta-electrica.png',
    ice: 'img/hielo.png',
    volcan: 'img/volcan.png'
};

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

function addEventToCesium(event, iconUrl) {
    if (event.geometry && event.geometry.length > 0) {
        let coords = event.geometry[0].coordinates;

        if (coords && coords.length >= 2) {
            let entity = viewer.entities.add({
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
            entity.category = event.categories[0].title;
            markers.push(entity);
        } else {
            console.warn(`Coordenadas no válidas para el evento: ${event.title}`);
        }
    } else {
        console.warn(`El evento no tiene geometría: ${event.title}`);
    }
}

async function fetchEvents(startDate = '', endDate = '') {
    try {
        let url = `https://eonet.gsfc.nasa.gov/api/v3/events?status=open`;
        if (startDate && endDate) {
            url += `&start=${startDate}&end=${endDate}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al obtener eventos: ${response.statusText}`);
        }
        const data = await response.json();
        
        console.log(`Eventos obtenidos de la API:`, data.events);

        viewer.entities.removeAll();
        markers = [];

        data.events.forEach(event => {
            let iconUrl;
            let category = event.categories[0].title;

            if (category === 'Wildfires') {
                iconUrl = icons.wildfire;
            } else if (category === 'Severe Storms') {
                iconUrl = icons.storm;
            } else if (category === 'Sea and Lake Ice') {
                iconUrl = icons.ice;
            } else if (category === 'Volcanoes') {
                iconUrl = icons.volcan;
            }

            if (iconUrl) {
                addEventToCesium(event, iconUrl);
            } else {
                console.error(`No se encontró icono para la categoría: ${category}`);
            }
        });

        applyFilters();

    } catch (error) {
        console.error('Error al obtener los eventos:', error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

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

document.getElementById('cancel-filter').addEventListener('click', async function () {
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    await fetchEvents();
});

function applyFilters() {
    markers.forEach(marker => {
        let category = marker.category;

        if (
            (category === 'Wildfires' && activeFilters.wildfires) ||
            (category === 'Severe Storms' && activeFilters.storms) ||
            (category === 'Sea and Lake Ice' && activeFilters.ice) ||
            (category === 'Volcanoes' && activeFilters.volcanes)
        ) {
            marker.show = true;
        } else {
            marker.show = false;
        }
    });
}

async function fetchTiempo(lat, lon) {
    const api_key = 'f2ccd80c8f58a0db41ea1b003a74f7e0';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;

    const response = await fetch(url);
    const weatherData = await response.json();

    return {
        temperature: weatherData.main.temp,
        icon: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`
    };
}

viewer.screenSpaceEventHandler.setInputAction(async function onLeftClick(movement) {
    const pickedFeature = viewer.scene.pick(movement.position);
    if (pickedFeature && pickedFeature.id) {
        const entity = pickedFeature.id;
        const coords = Cesium.Cartographic.fromCartesian(entity.position.getValue(Cesium.JulianDate.now()));
        const lat = Cesium.Math.toDegrees(coords.latitude);
        const lon = Cesium.Math.toDegrees(coords.longitude);

        const weatherInfo = await fetchTiempo(lat, lon);

        const popupContent = `
            <strong>${entity.description.getValue()}</strong><br>
            ${weatherInfo ? `<p><strong>Temperatura actual:</strong> ${weatherInfo.temperature} °C</p>` : 'Información del clima no disponible.'}
            <img src="${weatherInfo.icon}" alt="Icono del clima">
        `;
        viewer.entities.add({
            position: entity.position.getValue(Cesium.JulianDate.now()),
            label: {
                text: popupContent,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            }
        });

        document.getElementById('event-details').innerHTML = `
            <h3>Ubicación Seleccionada</h3>
            <p><strong>Temperatura actual:</strong> ${weatherInfo.temperature} °C</p>
        `;
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

fetchEvents();
