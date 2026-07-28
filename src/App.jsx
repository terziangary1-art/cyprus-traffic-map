import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { getTrafficData } from "./traffic";
import roadworksImage from "./assets/roadworks.png";


const roadworksIcon = L.icon({
  iconUrl: roadworksImage,
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45]
});

function App() {

  const [events, setEvents] = useState([]);
const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {

  async function loadTraffic() {

    const data = await getTrafficData();

    if (data) {
  setEvents(data);
  setLastUpdated(new Date());
}

  }


  loadTraffic();


  const interval = setInterval(() => {
    loadTraffic();
  }, 300000);


  return () => clearInterval(interval);


}, []);


  const cyprusPosition = [35.1264, 33.4299];


  return (

    <div className="app">

<header className="header">

  <h1> Cyprus Live Roadworks Map</h1>

  <div className="stats">

    <div>
      🚧 <strong>{events.length}</strong> Active Roadworks
    </div>

    <div>
      🕒 {lastUpdated
        ? lastUpdated.toLocaleTimeString()
        : "Loading..."}
    </div>

  </div>

</header>

      <MapContainer
        center={cyprusPosition}
        zoom={9}
        className="map"
      >

        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {events.map((event, index) => (

          <Marker
  key={index}
  position={[
    event.latitude,
    event.longitude
  ]}
  icon={roadworksIcon}
>

            <Popup>

              <b>Traffic Event</b>
              <br />

              {event.description}

            </Popup>

          </Marker>

        ))}


      </MapContainer>


    </div>

  );

}


export default App;