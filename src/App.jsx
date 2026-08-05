import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

import {
  getTrafficData,
  getBluetoothSensorCount,
  getBluetoothSensors,
  getWIMSensors
} from "./traffic";

import roadworksImage from "./assets/roadworks.png";
import wazeImage from "./assets/waze.png";
import bluetoothImage from "./assets/bluetooth.png";
import wimImage from "./assets/wim.png";


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
  iconAnchor: [9, 18],
  popupAnchor: [0, -20]
});


const wimIcon = L.icon({
  iconUrl: wimImage,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22]
});



function App() {


  const [events, setEvents] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);


  const [bluetoothSensors, setBluetoothSensors] = useState(0);
  const [sensorList, setSensorList] = useState([]);


  const [showBluetooth, setShowBluetooth] = useState(false);
  const [showSensorTable, setShowSensorTable] = useState(false);


  const [showWIMSensors, setShowWIMSensors] = useState(false);
  const [showWIMTable, setShowWIMTable] = useState(false);
  const [wimSensors, setWimSensors] = useState([]);



  useEffect(() => {


    async function loadTraffic() {


      const data = await getTrafficData();

      const sensors = await getBluetoothSensorCount();

      const sensorsList = await getBluetoothSensors();

      const wimList = await getWIMSensors();



      setSensorList(sensorsList);

      setWimSensors(wimList);



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


        <div className="stats">


          <div>
            🚧 <strong>{events.length}</strong> Active Roadworks
          </div>


          <div>
            📡 <strong>{bluetoothSensors}</strong> Bluetooth Sensors
          </div>


          <div>
            ⚖️ <strong>{wimSensors.length}</strong> WIM Sensors
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



      {/* FLOATING MAP CONTROLS */}

      <div className="map-controls">


        <label>

          <input
            type="checkbox"
            checked={showBluetooth}
            onChange={(e)=>setShowBluetooth(e.target.checked)}
          />

          📡 Show Bluetooth Sensors

        </label>


        <br/>


        <label>

          <input
            type="checkbox"
            checked={showSensorTable}
            onChange={(e)=>setShowSensorTable(e.target.checked)}
          />

          📋 Bluetooth List

        </label>


        <br/>


        <label>

          <input
            type="checkbox"
            checked={showWIMSensors}
            onChange={(e)=>setShowWIMSensors(e.target.checked)}
          />

          ⚖️ Show WIM Sensors

        </label>


        <br/>


        <label>

          <input
            type="checkbox"
            checked={showWIMTable}
            onChange={(e)=>setShowWIMTable(e.target.checked)}
          />

          ⚖️ WIM List

        </label>


      </div>





      {showSensorTable && (

        <div className="sensor-table">

          <h3>
            📡 Bluetooth Sensors ({sensorList.length})
          </h3>


          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Location</th>
              </tr>

            </thead>


            <tbody>

            {sensorList.map((sensor,index)=>(

              <tr key={index}>

                <td>{sensor.id}</td>

                <td>{sensor.name}</td>

              </tr>

            ))}

            </tbody>


          </table>


        </div>

      )}






      {showWIMTable && (

        <div className="sensor-table">

          <h3>
            ⚖️ WIM Sensors ({wimSensors.length})
          </h3>


          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Location</th>
              </tr>

            </thead>


            <tbody>

            {wimSensors.map((sensor,index)=>(

              <tr key={index}>

                <td>{sensor.id}</td>

                <td>{sensor.name}</td>

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



        {events.map((event,index)=>(

          <Marker

            key={index}

            position={[
              event.latitude,
              event.longitude
            ]}

            icon={
              event.source==="Waze"
              ? wazeIcon
              : operatorIcon
            }

          >

            <Popup>

  <b>
    {
      event.source==="Waze"
      ? "📍 Waze Report"
      : "🚧 Official Roadworks"
    }
  </b>

  <br/><br/>

  <b>Source:</b> {event.source}

  <br/>

  <b>Severity:</b> {event.severity}

  <br/><br/>

  <b>Description:</b>

  <br/>

  {event.description}

  <br/><br/>

  <b>Start:</b>

  <br/>

  {event.overallStartTime || "Not available"}

  <br/><br/>

  <b>End:</b>

  <br/>

  {event.overallEndTime || "Not available"}

  <br/><br/>

  <b>Road Work Type:</b>

  <br/>

  {event.roadMaintenanceType || "Not available"}

  <br/><br/>

  <b>Subtype:</b>

  <br/>

  {event.subtype || "Not available"}

</Popup>


          </Marker>

        ))}






        {showBluetooth && sensorList.map((sensor,index)=>(

          <Marker

            key={"bluetooth-"+index}

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

              <br/>

              ID: {sensor.id}

              <br/>

              {sensor.name}


            </Popup>


          </Marker>


        ))}





        {showWIMSensors && wimSensors.map((sensor,index)=>(

          <Marker

            key={"wim-"+index}

            position={[
              sensor.latitude,
              sensor.longitude
            ]}

            icon={wimIcon}

          >

            <Popup>

              <b>
                ⚖️ WIM Sensor
              </b>

              <br/>

              ID: {sensor.id}

              <br/>

              {sensor.name}

            </Popup>


          </Marker>


        ))}



      </MapContainer>



    </div>


  );

}


export default App;