import L from "leaflet";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./App.css";

import {
  getTrafficData,
  getBluetoothSensorCount,
  getBluetoothSensors,
  getWIMSensors,
  getTrafficDetectionSensors
} from "./traffic";

import roadworksImage from "./assets/roadworks.png";
import wazeImage from "./assets/waze.png";
import bluetoothImage from "./assets/bluetooth.png";
import wimImage from "./assets/wim.png";


// ======================================================
// TRAFFIC4CYPRUS WORKERS
// ======================================================

const SENSOR_LOCATION_URL =
  "https://bitter-cake-f0fd.terzian-gary1.workers.dev/";

const LIVE_MEASUREMENT_URL =
  "https://still-cloud-c56a.terzian-gary1.workers.dev/";


// ======================================================
// ICONS
// ======================================================

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


const trafficDetectionIcon = L.divIcon({
  html: "🚦",
  className: "traffic-detection-icon",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});


// ======================================================
// SPEED MARKER ICON
// ======================================================

function createTrafficSpeedIcon(speed) {

  const displaySpeed =
    speed !== null &&
    speed !== undefined &&
    !Number.isNaN(speed)
      ? Math.round(speed)
      : "--";


  return L.divIcon({

    html: `
      <div class="traffic-speed-marker">

        <div class="traffic-speed-circle">
          ${displaySpeed}
        </div>

        <div class="traffic-speed-light">
          🚦
        </div>

      </div>
    `,

    className:
      "traffic-speed-icon-container",

    iconSize: [50, 76],

    iconAnchor: [25, 76],

    popupAnchor: [0, -76]

  });

}


// ======================================================
// PARSE LIVE MEASUREMENTS XML
// ======================================================

function parseTrafficMeasurements(xmlText) {

  const parser = new DOMParser();

  const xml =
    parser.parseFromString(
      xmlText,
      "application/xml"
    );


  // ----------------------------------------------------
  // CHECK FOR XML ERROR
  // ----------------------------------------------------

  const parserError =
    xml.getElementsByTagName(
      "parsererror"
    );

  if (parserError.length > 0) {

    console.error(
      "Traffic XML parser error:",
      parserError[0].textContent
    );

    return {};

  }


  const measurements = {};


  const siteMeasurements =
    xml.getElementsByTagNameNS(
      "http://datex2.eu/schema/3/roadTrafficData",
      "siteMeasurements"
    );


  console.log(
    "Measurement sites found in XML:",
    siteMeasurements.length
  );


  for (const site of siteMeasurements) {

    // --------------------------------------------------
    // MEASUREMENT SITE REFERENCE
    // --------------------------------------------------

    const reference =
      site.getElementsByTagNameNS(
        "http://datex2.eu/schema/3/roadTrafficData",
        "measurementSiteReference"
      )[0];


    if (!reference) {
      continue;
    }


    const id =
      reference.getAttribute("id");


    if (!id) {
      continue;
    }


    // --------------------------------------------------
    // FLOW
    // --------------------------------------------------

    const flowElement =
      site.getElementsByTagNameNS(
        "http://datex2.eu/schema/3/common",
        "vehicleFlowRate"
      )[0];


    let flow = null;


    if (flowElement) {

      const value =
        parseFloat(
          flowElement.textContent
        );


      if (!Number.isNaN(value)) {

        flow = value;

      }

    }


    // --------------------------------------------------
    // SPEED
    // --------------------------------------------------

    const speedElement =
      site.getElementsByTagNameNS(
        "http://datex2.eu/schema/3/common",
        "speed"
      )[0];


    let speed = null;


    if (speedElement) {

      const value =
        parseFloat(
          speedElement.textContent
        );


      // Traffic4Cyprus uses -1
      // when speed is unavailable.

      if (
        !Number.isNaN(value) &&
        value >= 0
      ) {

        speed = value;

      }

    }


    // --------------------------------------------------
    // STORE
    // --------------------------------------------------

    measurements[String(id)] = {

      id: String(id),

      flow,

      speed

    };

  }


  return measurements;

}


// ======================================================
// NORMALISE VALUE FOR MATCHING
// ======================================================

function normaliseId(value) {

  if (
    value === undefined ||
    value === null
  ) {

    return null;

  }


  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

}


// ======================================================
// GET ALL POSSIBLE SENSOR IDs
// ======================================================

function getPossibleSensorIds(sensor) {

  if (!sensor) {
    return [];
  }


  const values = [

    sensor.id,
    sensor.ID,

    sensor.code,
    sensor.Code,

    sensor.guid,
    sensor.GUID,

    sensor.siteId,
    sensor.siteID,

    sensor.measurementSiteId,
    sensor.measurementSiteID,

    sensor.measurementSiteReference,
    sensor.measurementSiteReferenceId,

    sensor.siteIdentification,
    sensor.siteIdentificationId,
    sensor.siteIdentificationID,

    sensor.siteIdentificationCode,

    sensor.identification,
    sensor.identificationId,
    sensor.identificationID,

    sensor.reference,
    sensor.referenceId,

    sensor.detectorId,
    sensor.detectionUnitId,

    sensor.locationId,
    sensor.locationID

  ];


  const ids = [];


  for (const value of values) {

    const id =
      normaliseId(value);


    if (
      id &&
      !ids.includes(id)
    ) {

      ids.push(id);

    }

  }


  return ids;

}


// ======================================================
// GLOBAL MEASUREMENT CACHE
// ======================================================

let trafficMeasurementsGlobal = {};


// ======================================================
// MATCH MEASUREMENT TO SENSOR
// ======================================================

function getMeasurementForSensor(sensor) {

  if (!sensor) {
    return null;
  }


  const possibleIds =
    getPossibleSensorIds(sensor);


  console.log(
    "Trying to match sensor:",
    sensor,
    "Possible IDs:",
    possibleIds
  );


  // ----------------------------------------------------
  // DIRECT MATCH
  // ----------------------------------------------------

  for (
    const sensorId of possibleIds
  ) {

    if (
      trafficMeasurementsGlobal[
        sensorId
      ]
    ) {

      console.log(
        "MATCH FOUND:",
        sensorId
      );


      return (
        trafficMeasurementsGlobal[
          sensorId
        ]
      );

    }

  }


  // ----------------------------------------------------
  // NUMERIC MATCH
  // ----------------------------------------------------

  for (
    const sensorId of possibleIds
  ) {

    const numericId =
      sensorId.replace(
        /\D/g,
        ""
      );


    if (
      numericId &&
      trafficMeasurementsGlobal[
        numericId
      ]
    ) {

      console.log(
        "NUMERIC MATCH FOUND:",
        numericId
      );


      return (
        trafficMeasurementsGlobal[
          numericId
        ]
      );

    }

  }


  console.warn(
    "NO MEASUREMENT MATCH FOR SENSOR:",
    sensor
  );


  return null;

}


// ======================================================
// MAIN APP
// ======================================================

function App() {


  // ====================================================
  // ROADWORKS
  // ====================================================

  const [events, setEvents] =
    useState([]);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [showRoadworks, setShowRoadworks] =
    useState(true);


  // ====================================================
  // BLUETOOTH
  // ====================================================

  const [bluetoothSensors, setBluetoothSensors] =
    useState(0);

  const [sensorList, setSensorList] =
    useState([]);

  const [showBluetooth, setShowBluetooth] =
    useState(false);

  const [showSensorTable, setShowSensorTable] =
    useState(false);


  // ====================================================
  // WIM
  // ====================================================

  const [showWIMSensors, setShowWIMSensors] =
    useState(false);

  const [showWIMTable, setShowWIMTable] =
    useState(false);

  const [wimSensors, setWimSensors] =
    useState([]);


  // ====================================================
  // TRAFFIC DETECTION
  // ====================================================

  const [
    showTrafficDetection,
    setShowTrafficDetection
  ] = useState(false);


  const [
    trafficDetectionSensors,
    setTrafficDetectionSensors
  ] = useState([]);


  // ====================================================
  // TRAFFIC DETECTION DISPLAY MODE
  // ====================================================

  const [
    trafficDetectionDisplayMode,
    setTrafficDetectionDisplayMode
  ] = useState("info");


  // ====================================================
  // LIVE MEASUREMENTS
  // ====================================================

  const [
    trafficMeasurements,
    setTrafficMeasurements
  ] = useState({});


  const [
    measurementUpdated,
    setMeasurementUpdated
  ] = useState(null);


  // ====================================================
  // LOAD NORMAL MAP DATA
  // ====================================================

  useEffect(() => {

    async function loadTraffic() {

      try {

        // ----------------------------------------------
        // ROADWORKS
        // ----------------------------------------------

        const data =
          await getTrafficData();


        // ----------------------------------------------
        // BLUETOOTH
        // ----------------------------------------------

        const sensors =
          await getBluetoothSensorCount();


        const sensorsList =
          await getBluetoothSensors();


        // ----------------------------------------------
        // WIM
        // ----------------------------------------------

        const wimList =
          await getWIMSensors();


        // ----------------------------------------------
        // TRAFFIC DETECTION
        // ----------------------------------------------

        const trafficDetectionList =
          await getTrafficDetectionSensors();


        // ----------------------------------------------
        // STATE
        // ----------------------------------------------

        setSensorList(
          sensorsList || []
        );


        setWimSensors(
          wimList || []
        );


        setTrafficDetectionSensors(
          trafficDetectionList || []
        );


        if (data) {

          setEvents(data);

          setLastUpdated(
            new Date()
          );

        }


        setBluetoothSensors(
          sensors || 0
        );


        console.log(
          "Traffic Detection Units:",
          trafficDetectionList
        );


      }

      catch (error) {

        console.error(
          "Error loading map data:",
          error
        );

      }

    }


    loadTraffic();


    const interval =
      setInterval(
        loadTraffic,
        300000
      );


    return () =>
      clearInterval(interval);

  }, []);


  // ====================================================
  // LOAD LIVE MEASUREMENTS
  // ====================================================

  useEffect(() => {

    async function loadMeasurements() {

      try {

        console.log(
          "Loading live Traffic4Cyprus measurements..."
        );


        const response =
          await fetch(
            LIVE_MEASUREMENT_URL
          );


        if (!response.ok) {

          throw new Error(
            `HTTP ${response.status}`
          );

        }


        const xmlText =
          await response.text();


        console.log(
          "Live XML length:",
          xmlText.length
        );


        const measurements =
          parseTrafficMeasurements(
            xmlText
          );


        // ------------------------------------------------
        // SAVE GLOBAL CACHE
        // ------------------------------------------------

        const normalisedMeasurements = {};


        for (
          const [id, measurement]
          of Object.entries(
            measurements
          )
        ) {

          const key =
            normaliseId(id);


          if (key) {

            normalisedMeasurements[
              key
            ] = measurement;

          }

        }


        trafficMeasurementsGlobal =
          normalisedMeasurements;


        setTrafficMeasurements(
          normalisedMeasurements
        );


        setMeasurementUpdated(
          new Date()
        );


        console.log(
          "LIVE MEASUREMENTS:",
          normalisedMeasurements
        );


        // ------------------------------------------------
        // SPECIFIC DEBUG FOR SITE 116
        // ------------------------------------------------

        if (
          normalisedMeasurements["116"]
        ) {

          console.log(
            "================================"
          );

          console.log(
            "SITE 116 FOUND"
          );

          console.log(
            normalisedMeasurements["116"]
          );

          console.log(
            "================================"
          );

        }

        else {

          console.warn(
            "SITE 116 NOT FOUND IN LIVE XML"
          );

        }

      }

      catch (error) {

        console.error(
          "Error loading live measurements:",
          error
        );

      }

    }


    loadMeasurements();


    // Refresh every minute

    const interval =
      setInterval(
        loadMeasurements,
        60000
      );


    return () =>
      clearInterval(interval);

  }, []);


  // ====================================================
  // CYPRUS MAP POSITION
  // ====================================================

  const cyprusPosition = [
    35.1264,
    33.4299
  ];


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <div className="app">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <h1>
          CY Cyprus Live Roadworks Map
        </h1>


        <div className="stats">


          <div>

            🚧{" "}

            <strong>
              {events.length}
            </strong>{" "}

            Active Roadworks

          </div>


          <div>

            📡{" "}

            <strong>
              {bluetoothSensors}
            </strong>{" "}

            Bluetooth Sensors

          </div>


          <div>

            ⚖️{" "}

            <strong>
              {wimSensors.length}
            </strong>{" "}

            WIM Sensors

          </div>


          <div>

            🚦{" "}

            <strong>
              {trafficDetectionSensors.length}
            </strong>{" "}

            Traffic Detection Units

          </div>


          <div>

            📊{" "}

            <strong>
              {Object.keys(
                trafficMeasurements
              ).length}
            </strong>{" "}

            Live Measurements

          </div>


          <div>

            🕒{" "}

            {lastUpdated
              ? lastUpdated.toLocaleTimeString()
              : "Loading..."}

          </div>


          <div>

            📡{" "}

            {measurementUpdated
              ? `Live: ${measurementUpdated.toLocaleTimeString()}`
              : "Live: Loading..."}

          </div>


        </div>

      </header>


      {/* =================================================
          MAP CONTROLS
      ================================================= */}

      <div className="map-controls">


        <label>

          <input
            type="checkbox"
            checked={showRoadworks}
            onChange={(e) =>
              setShowRoadworks(
                e.target.checked
              )
            }
          />

          🚧 Show Roadworks

        </label>


        <br />


        <label>

          <input
            type="checkbox"
            checked={showBluetooth}
            onChange={(e) =>
              setShowBluetooth(
                e.target.checked
              )
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
              setShowSensorTable(
                e.target.checked
              )
            }
          />

          📋 Bluetooth List

        </label>


        <br />


        <label>

          <input
            type="checkbox"
            checked={showWIMSensors}
            onChange={(e) =>
              setShowWIMSensors(
                e.target.checked
              )
            }
          />

          ⚖️ Show WIM Sensors

        </label>


        <br />


        <label>

          <input
            type="checkbox"
            checked={showWIMTable}
            onChange={(e) =>
              setShowWIMTable(
                e.target.checked
              )
            }
          />

          ⚖️ WIM List

        </label>


        <br />


        {/* =================================================
            TRAFFIC DETECTION CONTROL
        ================================================= */}

        <label>

          <input
            type="checkbox"
            checked={showTrafficDetection}
            onChange={(e) =>
              setShowTrafficDetection(
                e.target.checked
              )
            }
          />

          🚦 Show Traffic Detection Units

        </label>


        {showTrafficDetection && (

          <div className="traffic-display-controls">

            <strong>
              Display:
            </strong>


            <br />


            <label>

              <input
                type="radio"
                name="trafficDetectionDisplay"
                value="info"
                checked={
                  trafficDetectionDisplayMode ===
                  "info"
                }
                onChange={() =>
                  setTrafficDetectionDisplayMode(
                    "info"
                  )
                }
              />

              📋 Info

            </label>


            <br />


            <label>

              <input
                type="radio"
                name="trafficDetectionDisplay"
                value="speed"
                checked={
                  trafficDetectionDisplayMode ===
                  "speed"
                }
                onChange={() =>
                  setTrafficDetectionDisplayMode(
                    "speed"
                  )
                }
              />

              📊 Speed

            </label>

          </div>

        )}

      </div>


      {/* =================================================
          BLUETOOTH TABLE
      ================================================= */}

      {showSensorTable && (

        <div className="sensor-table">

          <h3>

            📡 Bluetooth Sensors (
            {sensorList.length}
            )

          </h3>


          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>Location</th>

              </tr>

            </thead>


            <tbody>

              {sensorList.map(
                (sensor, index) => (

                  <tr key={index}>

                    <td>
                      {sensor.id}
                    </td>

                    <td>
                      {sensor.name}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}


      {/* =================================================
          WIM TABLE
      ================================================= */}

      {showWIMTable && (

        <div className="sensor-table">

          <h3>

            ⚖️ WIM Sensors (
            {wimSensors.length}
            )

          </h3>


          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>Location</th>

              </tr>

            </thead>


            <tbody>

              {wimSensors.map(
                (sensor, index) => (

                  <tr key={index}>

                    <td>
                      {sensor.id}
                    </td>

                    <td>
                      {sensor.name}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}


      {/* =================================================
          MAP
      ================================================= */}

      <MapContainer
        center={cyprusPosition}
        zoom={9}
        className="map"
      >


        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* =================================================
            ROADWORKS
        ================================================= */}

        {showRoadworks &&
          events.map(
            (event, index) => (

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

                    {event.source === "Waze"
                      ? "📍 Waze Report"
                      : "🚧 Official Roadworks"}

                  </b>

                  <br />
                  <br />

                  <b>Source:</b>{" "}
                  {event.source}

                  <br />

                  <b>Severity:</b>{" "}
                  {event.severity}

                  <br />
                  <br />

                  <b>Description:</b>

                  <br />

                  {event.description}

                  <br />
                  <br />

                  <b>Start:</b>

                  <br />

                  {event.overallStartTime ||
                    "Not available"}

                  <br />
                  <br />

                  <b>End:</b>

                  <br />

                  {event.overallEndTime ||
                    "Not available"}

                  <br />
                  <br />

                  <b>Road Work Type:</b>

                  <br />

                  {event.roadMaintenanceType ||
                    "Not available"}

                  <br />
                  <br />

                  <b>Subtype:</b>

                  <br />

                  {event.subtype ||
                    "Not available"}

                  <br />
                  <br />

                  <b>Bearing:</b>

                  <br />

                  {event.bearing ||
                    "Not available"}

                  <br />
                  <br />

                  <b>Original Number of Lanes:</b>

                  <br />

                  {event.originalNumberOfLanes ||
                    "Not available"}

                  <br />
                  <br />

                  <b>Affected Lane:</b>

                  <br />

                  {event.laneNumber ||
                    "Not available"}

                  <br />
                  <br />

                  <b>Affected Lanes:</b>

                  <br />

                  {event.affectedLanes ||
                    "Not available"}

                </Popup>

              </Marker>

            )
          )
        }


        {/* =================================================
            BLUETOOTH
        ================================================= */}

        {showBluetooth &&
          sensorList.map(
            (sensor, index) => (

              <Marker
                key={
                  "bluetooth-" + index
                }
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
                  <br />

                  <b>ID:</b>{" "}
                  {sensor.id}

                  <br />

                  {sensor.name}

                </Popup>

              </Marker>

            )
          )
        }


        {/* =================================================
            WIM
        ================================================= */}

        {showWIMSensors &&
          wimSensors.map(
            (sensor, index) => (

              <Marker
                key={
                  "wim-" + index
                }
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

                  <br />
                  <br />

                  <b>ID:</b>{" "}
                  {sensor.id}

                  <br />

                  {sensor.name}

                </Popup>

              </Marker>

            )
          )
        }


        {/* =================================================
            TRAFFIC DETECTION UNITS
        ================================================= */}

        {showTrafficDetection &&

          trafficDetectionSensors.map(
            (sensor, index) => {


              // ==========================================
              // GET LIVE MEASUREMENT
              // ==========================================

              const measurement =
                getMeasurementForSensor(
                  sensor
                );


              // ==========================================
              // SELECT DISPLAY ICON
              // ==========================================

              const markerIcon =
                trafficDetectionDisplayMode ===
                "speed"

                  ? createTrafficSpeedIcon(
                      measurement
                        ? measurement.speed
                        : null
                    )

                  : trafficDetectionIcon;


              return (

                <Marker

                  key={
                    "traffic-detection-" +
                    index
                  }

                  position={[
                    sensor.latitude,
                    sensor.longitude
                  ]}

                  icon={
                    markerIcon
                  }

                >


                  {/* ======================================
                      INFO MODE
                  ====================================== */}

                  {trafficDetectionDisplayMode ===
                    "info" && (

                    <Popup>

                      <b>
                        🚦 Traffic Detection Unit
                      </b>

                      <br />
                      <br />


                      {/* ----------------------------------
                          MEASUREMENT SITE ID
                      ---------------------------------- */}

                      <b>
                        Measurement Site ID:
                      </b>{" "}

                      {sensor.id ||
                        "Not available"}

                      <br />


                      {/* ----------------------------------
                          SITE IDENTIFICATION
                      ---------------------------------- */}

                      <b>
                        Site Identification:
                      </b>{" "}

                      {sensor.siteIdentification ||
                        sensor.siteIdentificationId ||
                        sensor.code ||
                        "Not available"}

                      <br />
                      <br />


                      {/* ----------------------------------
                          LOCATION
                      ---------------------------------- */}

                      <b>
                        Location:
                      </b>

                      <br />

                      {sensor.name ||
                        sensor.description ||
                        "Not available"}

                      <br />
                      <br />


                      {/* ==================================
                          LIVE TRAFFIC
                      ================================== */}

                      <div
                        style={{
                          padding: "10px",
                          margin: "5px 0",
                          borderRadius: "6px",
                          background: "#f1f5f9"
                        }}
                      >

                        <b>
                          📊 LIVE TRAFFIC
                        </b>

                        <br />
                        <br />


                        <b>
                          Speed:
                        </b>{" "}

                        {measurement &&
                        measurement.speed !== null

                          ? `${measurement.speed} km/h`

                          : "No data"}

                        <br />


                        <b>
                          Flow:
                        </b>{" "}

                        {measurement &&
                        measurement.flow !== null

                          ? `${measurement.flow} vehicles/hour`

                          : "No data"}

                      </div>


                      <br />


                      <b>
                        Equipment:
                      </b>{" "}

                      {sensor.equipmentType ||
                        sensor.model ||
                        "Loop"}

                      <br />
                      <br />


                      <b>
                        Coordinates:
                      </b>

                      <br />

                      {sensor.latitude},{" "}

                      {sensor.longitude}


                      {/* ==================================
                          DEBUG INFORMATION
                      ================================== */}

                      <br />
                      <br />

                      <details>

                        <summary>
                          Technical information
                        </summary>

                        <br />


                        <b>
                          Matching IDs:
                        </b>

                        <br />

                        {getPossibleSensorIds(
                          sensor
                        ).join(", ") ||
                          "None"}

                        <br />
                        <br />


                        <b>
                          Live measurement ID:
                        </b>{" "}

                        {measurement
                          ? measurement.id
                          : "Not matched"}

                      </details>

                    </Popup>

                  )}

                </Marker>

              );

            }

          )
        }


      </MapContainer>

    </div>

  );

}


export default App;