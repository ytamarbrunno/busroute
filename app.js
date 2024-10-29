  // Configuração do Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyAjcrIz-xMUKH6Wdy4DVa_H5dqM_csl03k",
    authDomain: "meuprojeto-9e112.firebaseapp.com",
    databaseURL: "https://meuprojeto-9e112-default-rtdb.firebaseio.com",
    projectId: "meuprojeto-9e112",
    storageBucket: "meuprojeto-9e112.appspot.com",
    messagingSenderId: "503482106433",
    appId: "1:503482106433:web:e56a21e659eb129043bcc0",
    measurementId: "G-GSF8S4SFHC"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Inicialização do mapa
const map = L.map('map').setView([-7.2155, -35.8813], 13); // Coordenadas iniciais (exemplo)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Criar ícones para o usuário e para o ônibus
const userIcon = L.icon({
    iconUrl: 'onibus.png', // Caminho do ícone do usuário
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const busIcon = L.icon({
    iconUrl: 'onibus.png', // Caminho do ícone do ônibus
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

// Armazena os marcadores no mapa
const markers = {};

// Função para salvar a posição do usuário no Firebase e centralizar o mapa
function updatePosition(position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    const userId = "meuIdUsuario"; // Substitua pelo ID único do usuário

    // Salva a localização no Firebase
    database.ref('locations/' + userId).set({
        latitude: userLat,
        longitude: userLng
    });

    // Centraliza o mapa na localização do usuário e atualiza o marcador do usuário
    if (!markers[userId]) {
        markers[userId] = L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
            .bindPopup("Você está aqui!")
            .openPopup();
    } else {
        markers[userId].setLatLng([userLat, userLng]);
    }

    map.setView([userLat, userLng], 13);
}

// Função para capturar a localização do usuário e atualizar em tempo real no Firebase
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updatePosition, showError);
    } else {
        alert("Geolocalização não é suportada por este navegador.");
    }
}

// Função para lidar com erros de geolocalização
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Usuário negou a solicitação de Geolocalização.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Localização indisponível.");
            break;
        case error.TIMEOUT:
            alert("A solicitação para obter a localização do usuário expirou.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Um erro desconhecido ocorreu.");
            break;
    }
}

// Função para adicionar e atualizar a localização dos ônibus em tempo real
function updateBusLocations() {
    database.ref('locations').on('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const userId = childSnapshot.key;
            const data = childSnapshot.val();
            
            // Verifica se o marcador já existe e atualiza a posição
            if (markers[userId]) {
                markers[userId].setLatLng([data.latitude, data.longitude]);
            } else {
                // Cria um novo marcador para cada ônibus
                const icon = (userId === "meuIdUsuario") ? userIcon : busIcon;
                const marker = L.marker([data.latitude, data.longitude], { icon }).addTo(map);
                marker.bindPopup(userId === "meuIdUsuario" ? "Você está aqui!" : `Ônibus: ${userId}`);
                markers[userId] = marker;
            }
        });
    });
}

// Inicializa a localização do usuário e escuta as atualizações dos ônibus
getLocation();
updateBusLocations();