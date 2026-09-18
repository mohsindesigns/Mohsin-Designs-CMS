const fs = require("fs");
const path = require("path");

const raw = fs.readFileSync(path.join(__dirname, "prod_locations_dump.json"), "utf8");

const statesIdx = raw.indexOf("=== STATES (");
const citiesIdx = raw.indexOf("=== CITIES (");

const statesStr = raw.substring(statesIdx + raw.substring(statesIdx).indexOf("\n"), citiesIdx).trim();
const states = JSON.parse(statesStr);

const ohioItems = states.filter(s => ["toledo", "cleveland", "dayton", "cincinnati", "hamilton", "henderson-copy-1788891586147"].includes(s.slug));
console.log("Ohio items in states collection:", JSON.stringify(ohioItems, null, 2));
