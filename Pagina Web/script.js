var map = L.map('map').setView([0, 0], 2);

var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

var openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '© OpenTopoMap'
});

var esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: '© ESRI, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS'
});

openStreetMap.addTo(map);

var baseMaps = {
    "OpenStreetMap": openStreetMap,
    "OpenTopoMap": openTopoMap,
    "ESRI World Imagery": esriWorldImagery
};

L.control.layers(baseMaps).addTo(map);

var icons = {
    wildfire: L.icon({
        iconUrl: 'img/incendio.png',
        iconSize: [32, 32]
    }),
    storm: L.icon({
        iconUrl: 'img/tormenta-electrica.png',
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

    if (new Date(startDate) > new Date(endDate)) {
        alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
        return;
    }

    if (startDate && endDate) {
        await fetchEvents(startDate, endDate);
    }
});

document.getElementById('cancel-filter').addEventListener('click', async function () {
    const startDate = '2000-01-01';
    const currentDate = new Date().toISOString().split('T')[0];

    document.getElementById('start-date').value = startDate;
    document.getElementById('end-date').value = currentDate;

    await fetchEvents(startDate, currentDate);
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

async function fetchEvents(startDate = '', endDate = '') {
    try {
        let url = `https://eonet.gsfc.nasa.gov/api/v3/events?status=open`;
        if (startDate && endDate) {
            url += `&start=${startDate}&end=${endDate}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        clearMarkers();

        for (const event of data.events) {
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

                marker.on('click', async function () {
                    const clickedWeatherInfo = await fetchTiempo(coords[1], coords[0]);
                    
                    let popupContent = `
                        <strong class='titulo-popup-tiempo'>${event.title}</strong><br>
                        <strong>Categoría</strong>: ${category}<br>
                        <strong>Fecha de inicio:<strong> ${formatDate(event.geometry[0].date)}<br>
                    `;

                    if (clickedWeatherInfo) {
                        popupContent += `
                            <p class='temperatura-popup-tiempo'><strong>Temperatura actual:</strong> ${clickedWeatherInfo.temperature} °C</p>
                            <img class='icono-popup-tiempo' src="${clickedWeatherInfo.icon}" alt="Icono del clima">
                        `;
                    } else {
                        popupContent += 'Información del clima no disponible.';
                    }

                    marker.bindPopup(popupContent).openPopup();

                    document.getElementById('event-details').innerHTML = `
                    <h3>${event.title}</h3>
                    <p><strong>Categoría:</strong> ${category}</p>
                    <p><strong>Fecha de inicio:</strong> ${formatDate(event.geometry[0].date)}</p>
                    ${clickedWeatherInfo ? `<p><strong>Temperatura actual:</strong> ${clickedWeatherInfo.temperature} °C</p>` : 'Información del clima no disponible.'}
                `;                
                });
            }
        }

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

async function fetchTiempo(lat, lon) {
    const api_key = 'f2ccd80c8f58a0db41ea1b003a74f7e0';  /* Usar f7bb196a8e2460fc6ed57801655f12a7 si la otra alcanza el limite de peticiones diarias*/
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;

    const response = await fetch(url);
    const weatherData = await response.json();

    return {
        temperature: weatherData.main.temp,
        icon: `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`
    };
}

map.on('click', async function (e) {
    const { lat, lng } = e.latlng;
    
    const weatherInfo = await fetchTiempo(lat, lng);

    const popupContent = `
        <strong>Ubicación seleccionada</strong><br>
        ${weatherInfo ? `<p><strong>Temperatura actual:</strong> ${weatherInfo.temperature} °C</p>` : 'Información del clima no disponible.'}
        <img src="${weatherInfo.icon}" alt="Icono del clima">
    `;

    L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);

    document.getElementById('event-details').innerHTML = `
        <h3>Ubicación Seleccionada</h3>
        <p><strong>Temperatura actual:</strong> ${weatherInfo.temperature} °C</p>
    `;
});

fetchEvents();
