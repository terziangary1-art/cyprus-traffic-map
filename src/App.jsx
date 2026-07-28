import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { getTrafficData } from "./traffic";
const roadworksIcon = L.divIcon({
  html: "🚧",
  className: "",
  iconSize: [30, 30]
});

function App() {

  const [events, setEvents] = useState([]);

  useEffect(() => {

  async function loadTraffic() {

    const data = await getTrafficData();

    if (data) {
      setEvents(data);
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

    <div>

      <h1>Cyprus Live Traffic Map</h1>


      <MapContainer
        center={cyprusPosition}
        zoom={9}
        style={{
          height: "600px",
          width: "100%"
        }}
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