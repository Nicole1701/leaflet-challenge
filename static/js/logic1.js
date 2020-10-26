// Define url for API call
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Grab the GeoJSON data
d3.json(queryUrl).then(data => {
  console.log(data);
  
  // Send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("Magnitude: " + feature.properties.mag +
    "<br />Location: "+ feature.properties.place +
    "<br />Depth: " + feature.geometry.coordinates[2] + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: (feature, latlng) => {
      return new L.circle(latlng,
        {radius: markerRadius(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        fillOpacity: .4,
        color: "black",
        stroke: true,
        weight: .2
      });
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [15.5994, -28.6731],
    zoom: 3,
    layers: [streetmap, earthquakes]
  });

  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add a legend to the map
  // stackoverflow.com/questions/45518547/cant-get-leaflet-legend-to-display-properly
var legend = L.control({ position: "bottomright" });

legend.onAdd = function(){
    var div = L.DomUtil.create("div","legend");
    div.innerHTML = [
      "<i class='d01'; ></i><span>-9-10</span><br>",
      "<i class='d02' style = 'height=25px';></i><span>11-30</span><br>",
      "<i class='d03' style = 'height=25px';></i><span>31-50</span><br>",
      "<i class='d04' style = 'height=25px';></i><span>51-70</span><br>",
      "<i class='d05' style = 'height=25px';></i><span>71-90</span><br>",
      "<i class='d06' style = 'height=25px';></i><span>90+</span><br>"
      ].join("");
    return div;
}
legend.addTo(myMap); 

}
// Function that will determine the color the circles based on depth
function markerColor(depth) {
  if (depth > 90) {
      return '#800026'
  } else if (depth > 70) {
      return '#BD0026'
  } else if (depth > 50) {
      return '#E31A1C'
  } else if (depth > 30) {
      return '#FC4E2A'
  } else if (depth > 10) {
      return '#FD8D3C'
  } else if (depth > -9) {
    return '#FEB24C'
}  else {
      return 'magenta'
  }
};
// Function that will determine radius based on magnitutde
function markerRadius(magnitude) {
  return magnitude * 20000;
};


