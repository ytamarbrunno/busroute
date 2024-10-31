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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Elementos HTML para o login
const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");

// Função de login para motoristas
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("Login realizado com sucesso!");
            loginSection.style.display = "none";
            appSection.style.display = "block";
        })
        .catch((error) => {
            console.error("Erro de login:", error.message);
            alert("Erro ao fazer login. Verifique suas credenciais.");
        });
});

// Inicialização do mapa
const map = L.map('map', { zoomControl: false }).setView([-7.2155, -35.8813], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

// Ícones personalizados para usuário e ônibus
const busIcon = L.icon({
    iconUrl: 'onibus.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

// Função para rastrear e exibir ônibus no mapa
function updateBusLocations() {
    database.ref('locations').on('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const busId = childSnapshot.key;

            // Atualiza ou adiciona marcadores de ônibus
            if (markers[busId]) {
                markers[busId].setLatLng([data.latitude, data.longitude]);
            } else {
                markers[busId] = L.marker([data.latitude, data.longitude], { icon: busIcon }).addTo(map)
                    .bindPopup(`Ônibus: ${busId}`);
            }
        });
    });
}

// Chamadas principais
updateBusLocations();
