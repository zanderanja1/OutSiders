import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Map() {
  const mapRef = useRef(null); // this will store the map instance

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('mapid').setView([46.55, 15.65], 13); // Coordinates updated to Maribor, Slovenia
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
      }).addTo(mapRef.current);

      // Define your custom icon
      const customIcon = L.icon({
        iconUrl: '/loc.png',
        iconSize: [25, 35], // change these values to change the icon size
        iconAnchor: [12, 50], // make sure to adjust these too
        popupAnchor: [-1, -50]
      });
      

      fetch('/input.geojson')
          .then(response => response.json())
          .then(data => {
              // Use the pointToLayer option to create a custom marker for each point
              L.geoJson(data, {
                  pointToLayer: function(feature, latlng) {
                      return L.marker(latlng, { icon: customIcon });
                  }
              }).addTo(mapRef.current);
          });
    }
  }, []); // passing an empty array as second argument triggers the callback in useEffect only after the initial render thus replicating `componentDidMount` lifecycle behaviour

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-12"> 
          <h1 className="text-center">Map</h1>
          <div id="mapid" style={{height: "600px", width: "100%"}}></div> 
        </div>
      </div>
    </div>
  );
}

export default Map;
