const apiKey =
  "AAPKe979d41231ba4b44a17a28f3804250dafzJ_y2T8gAkaFGUMDqe0GfdBdUBsgohkwpYeMe4JNHHUbR7S6e98CV0WI6MqLhtD";

const basemapEnum = "arcgis/navigation";

const map = L.map("map", {
  minZoom: 2,
});

map.setView([17.361719, 78.475166], 9); // Toronto

L.esri.Vector.vectorBasemapLayer(basemapEnum, {
  apiKey: apiKey,
}).addTo(map);

const directions = document.createElement("div");
directions.id = "directions";
directions.innerHTML =
  "Click on the map to create a start and end for the route.";
document.body.appendChild(directions);

const startLayerGroup = L.layerGroup().addTo(map);
const endLayerGroup = L.layerGroup().addTo(map);

const routeLines = L.layerGroup().addTo(map);

let currentStep = "start";
let startCoords, endCoords;

function updateRoute() {
  // Create the arcgis-rest-js authentication object to use later.
  const authentication = arcgisRest.ApiKeyManager.fromKey(apiKey);

  // make the API request
  arcgisRest
    .solveRoute({
      stops: [startCoords, endCoords],
      endpoint:
        "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve",
      authentication,
    })

    .then((response) => {
      routeLines.clearLayers();
      L.geoJSON(response.routes.geoJson).addTo(routeLines);

      const directionsHTML = response.directions[0].features
        .map((f) => f.attributes.text)
        .join("<br/>");
      directions.innerHTML = directionsHTML;
      startCoords = null;
      endCoords = null;
    })

    .catch((error) => {
      console.error(error);
      alert(
        "There was a problem using the route service. See the console for details."
      );
    });
}

map.on("click", (e) => {
  const coordinates = [e.latlng.lng, e.latlng.lat];

  if (currentStep === "start") {
    startLayerGroup.clearLayers();
    endLayerGroup.clearLayers();
    routeLines.clearLayers();

    L.marker(e.latlng).addTo(startLayerGroup);
    startCoords = coordinates;

    currentStep = "end";
  } else {
    L.marker(e.latlng).addTo(endLayerGroup);
    endCoords = coordinates;

    currentStep = "start";
  }

  if (startCoords && endCoords) {
    updateRoute();
  }
});
