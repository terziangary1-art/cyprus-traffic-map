import axios from "axios";


// ============================================================
// CLOUDFLARE WORKER URLS
// ============================================================

// ROADWORKS / TRAFFIC EVENTS
const trafficURL =
  "https://silent-dawn-29f1.terzian-gary1.workers.dev/";

// BLUETOOTH
const bluetoothURL =
  "https://flat-cloud-84bd.terzian-gary1.workers.dev/";

// WIM
const wimURL =
  "https://super-band-2161.terzian-gary1.workers.dev/";

// TRAFFIC DETECTION MEASUREMENT SITE TABLE
const trafficDetectionURL =
  "https://ancient-paper-b8b3.terzian-gary1.workers.dev/";


// ============================================================
// ROADWORKS / TRAFFIC EVENTS
// ============================================================

export async function getTrafficData() {

  try {

    const response =
      await axios.get(
        trafficURL
      );


    const parser =
      new DOMParser();


    const xml =
      parser.parseFromString(
        response.data,
        "text/xml"
      );


    const records =
      xml.getElementsByTagNameNS(
        "*",
        "situationRecord"
      );


    const events = [];


    for (
      let i = 0;
      i < records.length;
      i++
    ) {

      const record =
        records[i];


      const latitude =
        record
          .getElementsByTagNameNS(
            "*",
            "latitude"
          )[0]
          ?.textContent;


      const longitude =
        record
          .getElementsByTagNameNS(
            "*",
            "longitude"
          )[0]
          ?.textContent;


      const description =
        record
          .getElementsByTagName(
            "description"
          )[0]
          ?.textContent;


      const sourceElement =
        record
          .getElementsByTagName(
            "sourceIdentification"
          )[0];


      const source =
        sourceElement
          ? sourceElement.textContent
          : "Unknown";


      const severity =
        record
          .getElementsByTagNameNS(
            "*",
            "severity"
          )[0]
          ?.textContent;


      const overallStartTime =
        record
          .getElementsByTagNameNS(
            "*",
            "overallStartTime"
          )[0]
          ?.textContent;


      const overallEndTime =
        record
          .getElementsByTagNameNS(
            "*",
            "overallEndTime"
          )[0]
          ?.textContent;


      const subtype =
        record
          .getElementsByTagName(
            "subtype"
          )[0]
          ?.textContent;


      const roadMaintenanceType =
        record
          .getElementsByTagNameNS(
            "*",
            "roadMaintenanceType"
          )[0]
          ?.textContent;


      const bearing =
        record
          .getElementsByTagNameNS(
            "*",
            "bearing"
          )[0]
          ?.textContent;


      const originalNumberOfLanes =
        record
          .getElementsByTagNameNS(
            "*",
            "originalNumberOfLanes"
          )[0]
          ?.textContent;


      const laneNumber =
        record
          .getElementsByTagNameNS(
            "*",
            "laneNumber"
          )[0]
          ?.textContent;


      const affectedLanes =
        record
          .getElementsByTagNameNS(
            "*",
            "affectedLanes"
          )[0]
          ?.textContent;


      const recordType =
        record.getAttribute(
          "xsi:type"
        ) ||
        record.getAttributeNS(
          "http://www.w3.org/2001/XMLSchema-instance",
          "type"
        );


      if (
        latitude &&
        longitude
      ) {

        events.push({

          latitude,
          longitude,
          description,
          source,
          severity,
          overallStartTime,
          overallEndTime,
          subtype,
          roadMaintenanceType,
          bearing,
          originalNumberOfLanes,
          laneNumber,
          affectedLanes,
          recordType

        });

      }

    }


    console.log(
      "Traffic events found:",
      events
    );


    return events;


  } catch (error) {

    console.error(
      "Error loading traffic data:",
      error
    );


    return null;

  }

}


// ============================================================
// BLUETOOTH SENSOR COUNT
// ============================================================

export async function getBluetoothSensorCount() {

  try {

    const response =
      await axios.get(
        bluetoothURL
      );


    const parser =
      new DOMParser();


    const xml =
      parser.parseFromString(
        response.data,
        "text/xml"
      );


    const measurementSites =
      xml.getElementsByTagNameNS(
        "*",
        "measurementSite"
      );


    let count = 0;


    for (
      let i = 0;
      i < measurementSites.length;
      i++
    ) {

      const site =
        measurementSites[i];


      const equipment =
        site
          .getElementsByTagNameNS(
            "*",
            "measurementEquipmentTypeUsed"
          )[0];


      const type =
        equipment
          ?.getElementsByTagNameNS(
            "*",
            "value"
          )[0]
          ?.textContent
          ?.trim();


      if (
        type === "Bluetooth"
      ) {

        count++;

      }

    }


    console.log(
      "Bluetooth sensors found:",
      count
    );


    return count;


  } catch (error) {

    console.error(
      "Error loading Bluetooth sensors:",
      error
    );


    return 0;

  }

}


// ============================================================
// BLUETOOTH SENSOR IDs
// ============================================================

export async function getBluetoothSensorIDs() {

  try {

    const response =
      await axios.get(
        bluetoothURL
      );


    const parser =
      new DOMParser();


    const xml =
      parser.parseFromString(
        response.data,
        "text/xml"
      );


    const measurementSites =
      xml.getElementsByTagNameNS(
        "*",
        "measurementSite"
      );


    const sensorIDs = [];


    for (
      let i = 0;
      i < measurementSites.length;
      i++
    ) {

      const site =
        measurementSites[i];


      const equipment =
        site
          .getElementsByTagNameNS(
            "*",
            "measurementEquipmentTypeUsed"
          )[0];


      const type =
        equipment
          ?.getElementsByTagNameNS(
            "*",
            "value"
          )[0]
          ?.textContent
          ?.trim();


      if (
        type === "Bluetooth"
      ) {

        const id =
          site
            .getElementsByTagNameNS(
              "*",
              "measurementSiteIdentification"
            )[0]
            ?.textContent
            ?.trim();


        if (id) {

          sensorIDs.push(id);

        }

      }

    }


    console.log(
      "Bluetooth sensor IDs:",
      sensorIDs
    );


    return sensorIDs;


  } catch (error) {

    console.error(
      "Error loading Bluetooth sensor IDs:",
      error
    );


    return [];

  }

}


// ============================================================
// BLUETOOTH SENSORS
// ============================================================

export async function getBluetoothSensors() {

  try {

    const response =
      await axios.get(
        bluetoothURL
      );


    const parser =
      new DOMParser();


    const xml =
      parser.parseFromString(
        response.data,
        "text/xml"
      );


    const measurementSites =
      xml.getElementsByTagNameNS(
        "*",
        "measurementSite"
      );


    const sensors = [];


    for (
      let i = 0;
      i < measurementSites.length;
      i++
    ) {

      const site =
        measurementSites[i];


      const equipment =
        site
          .getElementsByTagNameNS(
            "*",
            "measurementEquipmentTypeUsed"
          )[0];


      const type =
        equipment
          ?.getElementsByTagNameNS(
            "*",
            "value"
          )[0]
          ?.textContent
          ?.trim();


      if (
        type === "Bluetooth"
      ) {

        const id =
          site
            .getElementsByTagNameNS(
              "*",
              "measurementSiteIdentification"
            )[0]
            ?.textContent
            ?.trim();


        const name =
          site
            .getElementsByTagNameNS(
              "*",
              "measurementSiteName"
            )[0]
            ?.getElementsByTagNameNS(
              "*",
              "value"
            )[0]
            ?.textContent
            ?.trim();


        const coordinates =
          site
            .getElementsByTagNameNS(
              "*",
              "coordinatesForDisplay"
            )[0];


        const latitude =
          coordinates
            ?.getElementsByTagNameNS(
              "*",
              "latitude"
            )[0]
            ?.textContent
            ?.trim();


        const longitude =
          coordinates
            ?.getElementsByTagNameNS(
              "*",
              "longitude"
            )[0]
            ?.textContent
            ?.trim();


        sensors.push({

          id,
          name,
          latitude,
          longitude

        });

      }

    }


    console.log(
      "Bluetooth sensors with coordinates:",
      sensors
    );


    return sensors;


  } catch (error) {

    console.error(
      "Error loading Bluetooth sensors:",
      error
    );


    return [];

  }

}


// ============================================================
// WIM SENSORS
// ============================================================

export async function getWIMSensors() {

  try {

    const response =
      await axios.get(
        wimURL
      );


    const parser =
      new DOMParser();


    const xml =
      parser.parseFromString(
        response.data,
        "text/xml"
      );


    const measurementSites =
      xml.getElementsByTagNameNS(
        "*",
        "measurementSiteRecord"
      );


    const sensors = [];


    for (
      let i = 0;
      i < measurementSites.length;
      i++
    ) {

      const site =
        measurementSites[i];


      const id =
        site
          .getElementsByTagNameNS(
            "*",
            "identifier"
          )[0]
          ?.textContent
          ?.trim();


      const name =
        site
          .getElementsByTagNameNS(
            "*",
            "value"
          )[0]
          ?.textContent
          ?.trim();


      const latitude =
        site
          .getElementsByTagNameNS(
            "*",
            "latitude"
          )[0]
          ?.textContent
          ?.trim();


      const longitude =
        site
          .getElementsByTagNameNS(
            "*",
            "longitude"
          )[0]
          ?.textContent
          ?.trim();


      sensors.push({

        id,
        name,
        latitude,
        longitude

      });

    }


    console.log(
      "WIM sensors found:",
      sensors.length
    );


    console.log(
      sensors
    );


    return sensors;


  } catch (error) {

    console.error(
      "Error loading WIM sensors:",
      error
    );


    return [];

  }

}


// ============================================================
// TRAFFIC DETECTION SENSORS / LOOP DETECTORS
// ============================================================
//
// IMPORTANT:
//
// The MeasurementSiteTable contains:
//
// <measurementSite id="1">
//
// and separately:
//
// <measurementSiteIdentification>1000</measurementSiteIdentification>
//
// The MeasuredDataPublication references:
//
// <measurementSiteReference id="1">
//
// Therefore:
//
// sensor.id = measurementSite id
//
// is the value that MUST be used to join live measurements.
//
// ============================================================

export async function getTrafficDetectionSensors() {

  try {

    const response =
      await axios.get(
        trafficDetectionURL
      );


    const parser =
      new DOMParser();


    const xml =
      parser.parseFromString(
        response.data,
        "application/xml"
      );


    const measurementSites =
      xml.getElementsByTagNameNS(
        "*",
        "measurementSite"
      );


    const sensors = [];


    for (
      let i = 0;
      i < measurementSites.length;
      i++
    ) {

      const site =
        measurementSites[i];


      // ------------------------------------------------------
      // REAL XML MEASUREMENT SITE ID
      //
      // Example:
      //
      // <measurementSite id="1">
      //
      // This matches:
      //
      // <measurementSiteReference id="1">
      // ------------------------------------------------------

      const measurementId =
        site.getAttribute(
          "id"
        );


      // ------------------------------------------------------
      // Equipment type
      // ------------------------------------------------------

      const equipment =
        site
          .getElementsByTagNameNS(
            "*",
            "measurementEquipmentTypeUsed"
          )[0];


      const type =
        equipment
          ?.getElementsByTagNameNS(
            "*",
            "value"
          )[0]
          ?.textContent
          ?.trim();


      // Only Loop detectors

      if (
        type !== "Loop"
      ) {

        continue;

      }


      // ------------------------------------------------------
      // Traffic4Cyprus identification
      //
      // Example:
      //
      // 1000
      // ------------------------------------------------------

      const siteIdentification =
        site
          .getElementsByTagNameNS(
            "*",
            "measurementSiteIdentification"
          )[0]
          ?.textContent
          ?.trim();


      // ------------------------------------------------------
      // Name
      // ------------------------------------------------------

      const name =
        site
          .getElementsByTagNameNS(
            "*",
            "measurementSiteName"
          )[0]
          ?.getElementsByTagNameNS(
            "*",
            "value"
          )[0]
          ?.textContent
          ?.trim();


      // ------------------------------------------------------
      // Coordinates
      // ------------------------------------------------------

      const coordinates =
        site
          .getElementsByTagNameNS(
            "*",
            "coordinatesForDisplay"
          )[0];


      const latitude =
        coordinates
          ?.getElementsByTagNameNS(
            "*",
            "latitude"
          )[0]
          ?.textContent
          ?.trim();


      const longitude =
        coordinates
          ?.getElementsByTagNameNS(
            "*",
            "longitude"
          )[0]
          ?.textContent
          ?.trim();


      // ------------------------------------------------------
      // Validate
      // ------------------------------------------------------

      if (
        !measurementId ||
        !latitude ||
        !longitude
      ) {

        continue;

      }


      // ------------------------------------------------------
      // Store sensor
      // ------------------------------------------------------

      sensors.push({

        // THIS is used for live-data matching
        id: measurementId,

        // Human-readable Traffic4Cyprus ID
        siteIdentification,

        name,

        latitude,

        longitude,

        type

      });

    }


    console.log(
      "Traffic detection sites found:",
      sensors.length
    );


    console.log(
      "Traffic detection sensors:",
      sensors
    );


    return sensors;


  } catch (error) {

    console.error(
      "Error loading traffic detection sensors:",
      error
    );


    return [];

  }

}