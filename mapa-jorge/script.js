var miMapa = L.map('mapa').setView([41.3602185, 2.0954249], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(miMapa);

var iconoBase = L.Icon.extend({
    options: {
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }
});

var iconoTerremoto = new iconoBase({ iconUrl: 'IMG/terremoto.png' });
var iconoIncendio = new iconoBase({ iconUrl: 'IMG/incendio.png' });
var iconoTormenta = new iconoBase({ iconUrl: 'IMG/tormenta.png' });


// Incendios
L.marker([38.9939, -0.0252], { icon: iconoIncendio })
    .bindPopup("<h1>Incendio en Valencia</h1><p>Evento de incendio forestal.</p><p><strong>Fecha:</strong> 18 de septiembre de 2024</p>")
    .addTo(miMapa);

L.marker([37.1234, -3.6081], { icon: iconoIncendio })
    .bindPopup("<h1>Incendio en Granada</h1><p>Evento de incendio forestal.</p><p><strong>Fecha:</strong> 15 de septiembre de 2024</p>")
    .addTo(miMapa);

// Tormentas
L.marker([40.4168, -3.7038], { icon: iconoTormenta })
    .bindPopup("<h1>Tormenta en Madrid</h1><p>Tormenta registrada en el área.</p><p><strong>Fecha:</strong> 17 de septiembre de 2024</p>")
    .addTo(miMapa);

L.marker([39.4640, -0.3753], { icon: iconoTormenta })
    .bindPopup("<h1>Tormenta en Castellón</h1><p>Tormenta registrada en el área.</p><p><strong>Fecha:</strong> 14 de septiembre de 2024</p>")
    .addTo(miMapa);

// Terremotos
L.marker([38.3452, -0.4833], { icon: iconoTerremoto })
    .bindPopup("<h1>Terremoto en Alicante</h1><p>Pequeño terremoto reportado.</p><p><strong>Fecha:</strong> 16 de septiembre de 2024</p>")
    .addTo(miMapa);

L.marker([37.9922, -1.1307], { icon: iconoTerremoto })
    .bindPopup("<h1>Terremoto en Murcia</h1><p>Pequeño terremoto reportado.</p><p><strong>Fecha:</strong> 13 de septiembre de 2024</p>")
    .addTo(miMapa);

document.getElementById('filtrar').addEventListener('click', function() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    console.log('Filtrando desde', fechaInicio, 'hasta', fechaFin);
});

document.getElementById('filtrar').addEventListener('click', function() {
    const fechaInicio = new Date(document.getElementById('fechaInicio').value);
    const fechaFin = new Date(document.getElementById('fechaFin').value);

    marcadores.forEach(marcador => {
        const fechaEvento = new Date(marcador.getPopup().getContent());
        
        if (fechaEvento >= fechaInicio && fechaEvento <= fechaFin) {
            marcador.addTo(miMapa);
        } else {
            miMapa.removeLayer(marcador);
        }
    });
});