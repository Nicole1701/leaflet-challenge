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

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend
// gis.stackexchange.com/questions/193161/add-legend-to-leaflet-map
var legend = L.control({ position: "bottomright" });

  // Add information to the legend
  legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "info legend");
    var magRange = [0, 1, 2, 3, 4, 5];
    var labels = ['<strong> Earthquake Magnitude </strong>'];
 
    // Loop through the intervals and generate a label 
    // with a colored circle for each interval
    for (var i = 0; i < magRange.length; i++) {
     labels.push(
      '<i class="circle" style="background:' + markerColor(magRange[i]) + '"></i> ' +
      magRange[i] + (magRange[i+1] ? '&ndash;' + magRange[i+1] : '+'));
      }  //ends for loop
      div.innerHTML = labels.join('<br>');
      return div;

  };  // ends legend.onAdd
}

// Function that will determine the color the circles based on magnitude
function markerColor(depth) {
  if (depth > 90) {
    return '#b30024'
} else if (depth > 70) {
    return '#e3191c'
} else if (depth > 50) {
    return '#fc4e29'
} else if (depth > 30) {
    return '#fd8d3c'
} else if (depth > 10) {
    return '#feb14c'
} 
else {
    return '#fed976'
}
}

//Create radius function
function markerRadius(magnitude) {
  return magnitude * 20000;
};


