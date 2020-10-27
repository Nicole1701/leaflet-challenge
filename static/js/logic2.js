// Define url for API call
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Grab the GeoJSON data
d3.json(queryUrl).then(data => {
  console.log(data);

  // Send the data.features object to the createFeatures function
  createFeatures(data.features);
});


////////////Create Features Function////////////

function createFeatures(earthquakeData) {

// Define a function for each feature in the features array and create popup
  function onEachFeature(feature, layer) {
    layer.bindPopup("Magnitude: " + feature.properties.mag +
    "<br />Location: "+ feature.properties.place +
    "<br />Depth: " + feature.geometry.coordinates[2] + "</p>");
  }

  // Create GeoJSON layer containing earthquakeData object
  // Run the onEachFeature function
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

 // Send earthquakes layer to the createMap function
  createMap(earthquakes);
}

////////////Create Tectonic Plate Layer////////////
let tectonicPlates = new L.LayerGroup();

// Pull in the data 
d3.json("static/data/PB2002_boundaries.json").then(function(platedata) {
        
    // Add the data to the tectonicplates layer
    L.geoJson(platedata, {
        color: "orange", 
        weight: 2}
        ).addTo(tectonicPlates);

    //Then add the tectonicplates layer to the map.
    tectonicPlates.addTo(myMap);
});

////////////Create createMap Function////////////
function createMap(earthquakes) {

    // Create streetmap layer
     let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
     });

    // Create dark map layer
    let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Create light map layer
    let lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

     // Create outdoors map layer
     let outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // Create satellite map layer
     let satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });
   
  // Define a baseMaps object to hold base layers
  let baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Light Map": lightmap,
    "Outdoors Map": outdoorsmap,
    "Satellite Map" : satellitemap
  };

  // Create overlay object for earthquakes
  let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Create map with streetmap, earthquakes and tectonicPlate layers
  let myMap = L.map("map", {
    center: [15.5994, -28.6731],
    zoom: 3,
    layers: [streetmap, earthquakes, tectonicPlates]
  });

   // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

////////////Create Legend ////////////
//codepen.io/haakseth/pen/KQbjdO
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>Depth</h4>";
  div.innerHTML += '<i style="background: #FEB24C"></i><span>-9-10</span><br>';
  div.innerHTML += '<i style="background: #FD8D3C"></i><span>11-30</span><br>';
  div.innerHTML += '<i style="background: #FC4E2A"></i><span>31-50</span><br>';
  div.innerHTML += '<i style="background: #E31A1C"></i><span>51-70</span><br>';
  div.innerHTML += '<i style="background: #BD0026"></i><span>71-90</span><br>';
  div.innerHTML += '<i style="background: #800026"></i><span>91+</span><br>';
  
  return div;
};
legend.addTo(myMap); 

}
////////////Create Circle Color Function ////////////
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

////////////Create Circle Radius Function ////////////
function markerRadius(magnitude) {
  return magnitude * 20000;
};


