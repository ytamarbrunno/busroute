const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_DOMINIO.firebaseapp.com",
    databaseURL: "https://SEU_DOMINIO.firebaseio.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_BUCKET.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const map = L.map('map').setView([-7.2154, -35.8845], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

function updateMap(locations) {
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    for (const id in locations) {
        const loc = locations[id];
        L.marker([loc.lat, loc.lng]).addTo(map)
            .bindPopup(`Dispositivo: ${id}`).openPopup();
    }
}

function onLocationFound(e) {
    const locationData = { lat: e.latlng.lat, lng: e.latlng.lng };
    const userId = Math.random().toString(36).substr(2, 9);
    database.ref('locations/' + userId).set(locationData);
}

database.ref('locations').on('value', (snapshot) => {
    const locations = snapshot.val() || {};
    updateMap(locations);
});

map.locate({ setView: true, maxZoom: 16 });
map.on('locationfound', onLocationFound);
