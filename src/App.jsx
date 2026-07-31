import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

import {
  getTrafficData,
  getBluetoothSensorCount,
  getBluetoothSensors
} from "./traffic";

import roadworksImage from "./assets/roadworks.png";
import wazeImage from "./assets/waze.png";
import bluetoothImage from "./assets/bluetooth.png";


const operatorIcon = L.icon({
  iconUrl: roadworksImage,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});


const wazeIcon = L.icon({
  iconUrl: wazeImage,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});


const bluetoothIcon = L.icon({
  iconUrl: bluetoothImage,
  iconSize: [18, 18],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});


function App() {

  const [events, setEvents] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [bluetoothSensors, setBluetoothSensors] = useState(0);
  const [sensorList, setSensorList] = useState([]);

  const [showBluetooth, setShowBluetooth] = useState(false);
const [showSensorTable, setShowSensorTable] = useState(false);

  useEffect(() => {


    async function loadTraffic() {

      const data = await getTrafficData();

      const sensors = await getBluetoothSensorCount();

      const sensorsList = await getBluetoothSensors();


      setSensorList(sensorsList);


      if (data) {

        setEvents(data);

        setLastUpdated(new Date());

      }


      setBluetoothSensors(sensors);

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


        <h1>
          CY Cyprus Live Roadworks Map
        </h1>


        <div className="controls">

  <label>

    <input
      type="checkbox"
      checked={showBluetooth}
      onChange={(e) =>
        setShowBluetooth(e.target.checked)
      }
    />

    📡 Show Bluetooth Sensors

  </label>


  <br />


  <label>

    <input
      type="checkbox"
      checked={showSensorTable}
      onChange={(e) =>
        setShowSensorTable(e.target.checked)
      }
    />

    📋 Show Sensor List

  </label>


</div>



        <div className="stats">


          <div>
            🚧 <strong>{events.length}</strong> Active Roadworks
          </div>


          <div>
            📡 <strong>{bluetoothSensors}</strong> Bluetooth Sensors
          </div>


          <div>
            🕒 {
              lastUpdated
              ? lastUpdated.toLocaleTimeString()
              : "Loading..."
            }
          </div>


        </div>


      </header>
{showSensorTable && (

  <div className="sensor-table">

    <h3>
      📡 Bluetooth Sensors ({sensorList.length})
    </h3>


    <table>

      <thead>

        <tr>
          <th>Sensor ID</th>
          <th>Location</th>
        </tr>

      </thead>


      <tbody>


        {sensorList.map((sensor, index) => (

          <tr key={index}>

            <td>
              {sensor.id}
            </td>

            <td>
              {sensor.name}
            </td>

          </tr>

        ))}


      </tbody>


    </table>


  </div>

)}


      <MapContainer
        center={cyprusPosition}
        zoom={9}
        className="map"
      >


        <TileLayer

          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"

        />



        {/* ROADWORKS + WAZE MARKERS */}

        {events.map((event, index) => (

          <Marker

            key={index}

            position={[
              event.latitude,
              event.longitude
            ]}

            icon={
              event.source === "Waze"
              ? wazeIcon
              : operatorIcon
            }

          >

            <Popup>


              <b>

                {
                  event.source === "Waze"
                  ? "📍 Waze Report"
                  : "🚧 Official Roadworks"
                }

              </b>


              <br />


              {event.description}


            </Popup>


          </Marker>


        ))}



        {/* BLUETOOTH SENSOR MARKERS */}

        {showBluetooth && sensorList.map((sensor, index) => (


          <Marker

            key={"sensor-" + index}

            position={[
              sensor.latitude,
              sensor.longitude
            ]}

            icon={bluetoothIcon}

          >


            <Popup>


              <b>
                📡 Bluetooth Sensor
              </b>


              <br />


              ID: {sensor.id}


              <br />


              Location: {sensor.name}


            </Popup>


          </Marker>


        ))}



      </MapContainer>



    </div>

  );

}


export default App;