// =============== الإعدادات ===============
let map;
let userMarker = null;
let followMode = false;
let routeLayer = null;
let geolocationWatcher = null;

// =============== تهيئة الخريطة ===============
const initMap = () => {
  map = L.map('map').setView([24.774265, 46.738586], 12);

  const layers = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    }),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map &copy; OpenTopoMap'
    })
  };

  let currentLayer = layers.osm;
  currentLayer.addTo(map);

  // =============== التحكم في الطبقات ===============
  document.getElementById('layers-btn').addEventListener('click', () => {
    const menu = document.getElementById('layers-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  document.querySelectorAll('#layers-menu div').forEach(item => {
    item.addEventListener('click', () => {
      map.removeLayer(currentLayer);
      currentLayer = layers[item.getAttribute('data-layer')];
      currentLayer.addTo(map);
      document.getElementById('layers-menu').style.display = 'none';
    });
  });

  // =============== وضع الليلي ===============
  const toggleTheme = () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    document.getElementById('theme-toggle').textContent = isDark ? '🌙' : '☀️';
  };

  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
  document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // =============== الطقس ===============
  const updateWeather = (lat, lng) => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`)
      .then(res => res.json())
      .then(data => {
        const temp = data.current.temperature_2m;
        const code = data.current.weather_code;
        const weatherIcons = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 61: '🌧️', 71: '❄️', 80: '🌧️', 95: '⛈️' };
        const icon = weatherIcons[code] || '🌤️';
        document.getElementById('weather').textContent = `${icon} ${Math.round(temp)}°C`;
      })
      .catch(() => {
        document.getElementById('weather').textContent = '🌤️ --°C';
      });
  };

  // =============== البحث الذكي ===============
  const searchInput = document.getElementById('search');
  const suggestions = document.getElementById('suggestions');

  const showSuggestions = (query) => {
    if (!query.trim()) {
      suggestions.style.display = 'none';
      return;
    }
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`)
      .then(res => res.json())
      .then(data => {
        suggestions.innerHTML = '';
        data.forEach(place => {
          const div = document.createElement('div');
          div.textContent = place.display_name;
          div.addEventListener('click', () => {
            const lat = parseFloat(place.lat);
            const lng = parseFloat(place.lon);
            map.setView([lat, lng], 15);
            if (userMarker) map.removeLayer(userMarker);
            userMarker = L.marker([lat, lng]).addTo(map).bindPopup(place.display_name).openPopup();
            updateWeather(lat, lng);
            searchInput.value = '';
            suggestions.style.display = 'none';
          });
          suggestions.appendChild(div);
        });
        suggestions.style.display = data.length ? 'block' : 'none';
      });
  };

  searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    if (query.length > 2) {
      setTimeout(() => showSuggestions(query), 300);
    } else {
      suggestions.style.display = 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) suggestions.style.display = 'none';
  });

  // =============== زر تحديد الموقع + Follow Mode ===============
  document.getElementById('locate-btn').addEventListener('click', () => {
    followMode = !followMode;
    if (followMode) {
      if (geolocationWatcher) navigator.geolocation.clearWatch(geolocationWatcher);
      geolocationWatcher = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (userMarker) map.removeLayer(userMarker);
          userMarker = L.marker([lat, lng], {
            icon: L.divIcon({
              html: '<div style="font-size:24px;transform:rotate('+ (pos.coords.heading || 0) +'deg)">📍</div>',
              className: '',
              iconSize: [30, 30]
            })
          }).addTo(map);
          map.setView([lat, lng], 16);
          updateWeather(lat, lng);
        },
        () => alert('فشل الوصول لموقعك'),
        { enableHighAccuracy: true }
      );
    } else {
      if (geolocationWatcher) {
        navigator.geolocation.clearWatch(geolocationWatcher);
        geolocationWatcher = null;
      }
    }
  });

  // =============== الملاحة ===============
  document.getElementById('route-btn').addEventListener('click', () => {
    if (!userMarker) {
      alert('حدد موقعك أولًا (زر 📍)');
      return;
    }
    const dest = prompt('أدخل وجهتك:');
    if (!dest) return;

    const userLatLng = userMarker.getLatLng();
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(dest)}&format=json&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (!data[0]) return alert('المكان غير موجود');
        const destLat = parseFloat(data[0].lat);
        const destLng = parseFloat(data[0].lon);

        if (routeLayer) map.removeLayer(routeLayer);
        fetch(`https://router.project-osrm.org/route/v1/driving/${userLatLng.lng},${userLatLng.lat};${destLng},${destLat}?overview=full&geometries=geojson`)
          .then(r => r.json())
          .then(routeData => {
            const coords = routeData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            routeLayer = L.polyline(coords, { color: '#4285f4', weight: 5 }).addTo(map);
            map.fitBounds(routeLayer.getBounds());
          });
      });
  });

  // =============== مشاركة الموقع ===============
  document.getElementById('share-btn').addEventListener('click', () => {
    if (!userMarker) {
      alert('حدد موقعك أولًا');
      return;
    }
    const lat = userMarker.getLatLng().lat;
    const lng = userMarker.getLatLng().lng;
    const shareUrl = `${window.location.origin}${window.location.pathname}?lat=${lat}&lng=${lng}`;
    if (navigator.share) {
      navigator.share({ title: 'موقعي', url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('تم نسخ الرابط: ' + shareUrl);
      });
    }
  });

  // =============== تحميل الموقع من الرابط (مشاركة) ===============
  const urlParams = new URLSearchParams(window.location.search);
  const lat = urlParams.get('lat');
  const lng = urlParams.get('lng');
  if (lat && lng) {
    map.setView([parseFloat(lat), parseFloat(lng)], 15);
    userMarker = L.marker([parseFloat(lat), parseFloat(lng)]).addTo(map).bindPopup('الموقع المُشارك').openPopup();
    updateWeather(parseFloat(lat), parseFloat(lng));
  }
};

// =============== بدء التشغيل ===============
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMap);
} else {
  initMap();
}
