const fs = require('fs');

const raw = fs.readFileSync('completedata.json', 'utf8');
const data = JSON.parse(raw);

console.log("completedata.json services type:", typeof data.services, Array.isArray(data.services) ? "ARRAY" : "OBJECT");
if (data.services) {
  if (Array.isArray(data.services)) {
    console.log("Array length:", data.services.length);
    console.log("Titles:", data.services.map(s => s.title));
  } else {
    console.log("Keys in data.services:", Object.keys(data.services));
    if (data.services.services) {
      console.log("data.services.services length:", data.services.services.length);
      console.log("Titles in services.services:", data.services.services.map(s => s.title));
    }
  }
}
if (data.globalServices) {
  console.log("data.globalServices length:", data.globalServices.length);
}
