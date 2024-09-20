// Inicializa o mapa em Campina Grande
const map = L.map('map').setView([-7.2154, -35.8845], 12);

// Adiciona um layer de tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Adiciona um marcador
let userMarker;

// Função para atualizar a localização do usuário
function updateLocation() {
    map.locate({ watch: true, maxZoom: 16 });
}

// Função para lidar com a localização do usuário
function onLocationFound(e) {
    const { lat, lng } = e.latlng;

    // Se o marcador já existir, atualiza sua posição; caso contrário, cria um novo
    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
    } else {
        userMarker = L.marker([lat, lng]).addTo(map)
            .bindPopup('Você está aqui!')
            .openPopup();
    }

    // Centraliza o mapa na nova localização
    map.setView([lat, lng], 16);
}

// Função para lidar com erros na localização
function onLocationError(e) {
    alert(e.message);
}

// Atualiza a localização a cada 5 segundos
setInterval(updateLocation, 5000);

// Escuta os eventos de localização
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

// Começa a localizar o usuário
updateLocation();
