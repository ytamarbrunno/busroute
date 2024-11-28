// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBLAHqLES0A-KB8u36YsrMZu8Xb7XH_e9U",
    authDomain: "busroute-adad5.firebaseapp.com",
    databaseURL: "https://busroute-adad5-default-rtdb.firebaseio.com",
    projectId: "busroute-adad5",
    storageBucket: "busroute-adad5.appspot.com",
    messagingSenderId: "960709540693",
    appId: "1:960709540693:web:ea53e6591df3927faa0ddc",
    measurementId: "G-NKGS7NKLRD",
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Inicializa o mapa
const map = L.map("map", {
    center: [-7.2155, -35.8813], // Campina Grande
    zoom: 13,
});

// Adiciona camada de tile ao mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
}).addTo(map);

// Ícone para motoristas
const busIcon = L.icon({
    iconUrl: "onibus.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

// Armazena os marcadores no mapa
const busMarkers = {};

// Configuração das credenciais fixas
const FIXED_USERNAME = "123";
const FIXED_PASSWORD = "123";

// Identificador único para o motorista logado
let userId = null;

// Função para capturar e atualizar a localização no Firebase
function updateDriverLocation(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    if (userId) {
        const driverRef = database.ref(`locations/${userId}`);
        
        // Atualiza a localização do motorista
        driverRef.set({
            latitude,
            longitude,
        });

        // Configura remoção automática no Firebase quando desconectado
        driverRef.onDisconnect().remove();
    }
}

// Função para iniciar o rastreamento de localização
function startTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            updateDriverLocation,
            (error) => {
                console.error("Erro ao acessar a localização:", error);
            },
            { enableHighAccuracy: true }
        );

        // Inicia o heartbeat
        startHeartbeat();
    } else {
        alert("Geolocalização não é suportada pelo navegador.");
    }
}

// Função para exibir a localização de motoristas em tempo real no mapa
function displayDriversOnMap() {
    database.ref("locations").on("value", (snapshot) => {
        const activeDriverIds = new Set();

        snapshot.forEach((childSnapshot) => {
            const driverId = childSnapshot.key;
            const data = childSnapshot.val();
            activeDriverIds.add(driverId);

            // Atualiza ou adiciona marcadores no mapa
            if (busMarkers[driverId]) {
                busMarkers[driverId].setLatLng([data.latitude, data.longitude]);
            } else {
                const marker = L.marker([data.latitude, data.longitude], {
                    icon: busIcon,
                }).addTo(map);
                marker.bindPopup(`Motorista: ${driverId}`);
                busMarkers[driverId] = marker;
            }
        });

        // Remove marcadores de motoristas inativos
        Object.keys(busMarkers).forEach((driverId) => {
            if (!activeDriverIds.has(driverId)) {
                map.removeLayer(busMarkers[driverId]);
                delete busMarkers[driverId];
            }
        });
    });
}

// Função para enviar sinais de "heartbeat"
function startHeartbeat() {
    if (userId) {
        const driverRef = database.ref(`locations/${userId}`);
        
        // Atualiza um "heartbeat" regularmente
        setInterval(() => {
            driverRef.update({ lastActive: Date.now() });
        }, 5000); // Atualiza a cada 5 segundos
    }
}

// Função de login
document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o envio do formulário

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === FIXED_USERNAME && password === FIXED_PASSWORD) {
        alert("Login bem-sucedido!");

        // Define o ID do motorista logado e inicia o rastreamento
        userId = `driver_${Date.now()}`;
        startTracking();

        // Oculta a seção de login
        document.getElementById("login-section").style.display = "none";

        // Exibe o mapa
        document.getElementById("tempo-real").scrollIntoView();
    } else {
        alert("Credenciais inválidas. Tente novamente.");
    }
});

// Inicia a exibição de motoristas no mapa (clientes não precisam de login)
displayDriversOnMap();
