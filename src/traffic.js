import axios from "axios";

const trafficURL =
  "https://silent-dawn-29f1.terzian-gary1.workers.dev/";

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


  if (latitude && longitude) {

    events.push({
      latitude: Number(latitude),
      longitude: Number(longitude),
      description: description || "No description"
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