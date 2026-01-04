<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="UTF-8">
<title>Mapbox Map</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Mapbox CSS -->
<link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
<link href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1/mapbox-gl-geocoder.css" rel="stylesheet" />
<link href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.1/mapbox-gl-directions.css" rel="stylesheet" />

<style>
body { margin:0; padding:0; font-family:Arial }
#map { position:absolute; top:0; bottom:0; width:100%; }
</style>
</head>

<body>
<div id="map"></div>

<!-- Mapbox JS -->
<script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.1/mapbox-gl-geocoder.min.js"></script>
<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.1/mapbox-gl-directions.js"></script>

<script>
// 🔑 ضع API KEY هنا
mapboxgl.accessToken = "PUT_YOUR_MAPBOX_TOKEN_HERE";

// إنشاء الخريطة
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [35.2433, 38.9637], // تركيا
  zoom: 6
});

// أزرار التحكم
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());

// تحديد الموقع GPS
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  })
);

// البحث عن مكان
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder: "ابحث عن مكان"
  })
);

// رسم مسار (ملاحة)
map.addControl(
  new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: "metric",
    language: "ar"
  }),
  "top-left"
);
</script>
</body>
</html>
