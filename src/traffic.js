import axios from "axios";

const trafficURL =
  "https://silent-dawn-29f1.terzian-gary1.workers.dev/";
const bluetoothURL =
  "https://flat-cloud-84bd.terzian-gary1.workers.dev/";

export async function getTrafficData() {
  try {

    const response = await axios.get(trafficURL);

    const parser = new DOMParser();

    const xml = parser.parseFromString(
      response.data,
      "text/xml"
    );


const records = xml.getElementsByTagNameNS(
  "*",
  "situationRecord"
);

const events = [];

for (let i = 0; i < records.length; i++) {

  const record = records[i];

  const latitude = record
    .getElementsByTagNameNS("*", "latitude")[0]
    ?.textContent;

  const longitude = record
    .getElementsByTagNameNS("*", "longitude")[0]
    ?.textContent;

  const description = record
    .getElementsByTagName("description")[0]
    ?.textContent;
const sourceElement = record
    .getElementsByTagName("sourceIdentification")[0];

const source = sourceElement
    ? sourceElement.textContent
    : "Unknown";

  if (latitude && longitude) {
console.log(source);
    events.push({
  latitude,
  longitude,
  description,
  source
});

  }
}


console.log("Traffic events found:", events);

return events;

  } catch (error) {

    console.error("Error loading traffic data:", error);

    return null;

  }
}
export async function getBluetoothSensorCount() {
  try {

    const response = await axios.get(bluetoothURL);

    const parser = new DOMParser();

    const xml = parser.parseFromString(
      response.data,
      "text/xml"
    );


    const measurementSites = xml.getElementsByTagNameNS(
      "*",
      "measurementSite"
    );


    let count = 0;


    for (let i = 0; i < measurementSites.length; i++) {

      const site = measurementSites[i];


      const equipment = site.getElementsByTagNameNS(
        "*",
        "measurementEquipmentTypeUsed"
      )[0];


      const type = equipment
        ?.getElementsByTagNameNS("*", "value")[0]
        ?.textContent;


      if (type === "Bluetooth") {
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
export async function getBluetoothSensorIDs() {

  try {

    const response = await axios.get(bluetoothURL);

    const parser = new DOMParser();

    const xml = parser.parseFromString(
      response.data,
      "text/xml"
    );


    const measurementSites = xml.getElementsByTagNameNS(
      "*",
      "measurementSite"
    );


    const sensorIDs = [];


    for (let i = 0; i < measurementSites.length; i++) {

      const site = measurementSites[i];


      const equipment = site.getElementsByTagNameNS(
        "*",
        "measurementEquipmentTypeUsed"
      )[0];


      const type = equipment
        ?.getElementsByTagNameNS("*", "value")[0]
        ?.textContent;


      if (type === "Bluetooth") {


        const id = site
          .getElementsByTagNameNS(
            "*",
            "measurementSiteIdentification"
          )[0]
          ?.textContent;


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
export async function getBluetoothSensors() {

  try {

    const response = await axios.get(bluetoothURL);

    const parser = new DOMParser();

    const xml = parser.parseFromString(
      response.data,
      "text/xml"
    );


    const measurementSites = xml.getElementsByTagNameNS(
      "*",
      "measurementSite"
    );


    const sensors = [];


    for (let i = 0; i < measurementSites.length; i++) {

      const site = measurementSites[i];


      const equipment = site.getElementsByTagNameNS(
        "*",
        "measurementEquipmentTypeUsed"
      )[0];


      const type = equipment
        ?.getElementsByTagNameNS("*", "value")[0]
        ?.textContent;


      if (type === "Bluetooth") {


        const id = site
          .getElementsByTagNameNS(
            "*",
            "measurementSiteIdentification"
          )[0]
          ?.textContent;


        const name = site
          .getElementsByTagNameNS(
            "*",
            "measurementSiteName"
          )[0]
          ?.getElementsByTagNameNS("*", "value")[0]
          ?.textContent;


        const coordinates = site
          .getElementsByTagNameNS(
            "*",
            "coordinatesForDisplay"
          )[0];


        const latitude = coordinates
          ?.getElementsByTagNameNS("*", "latitude")[0]
          ?.textContent;


        const longitude = coordinates
          ?.getElementsByTagNameNS("*", "longitude")[0]
          ?.textContent;


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


  } catch(error) {

    console.error(
      "Error loading Bluetooth sensors:",
      error
    );

    return [];

  }

}