const fs = require('fs');
const dataPath = 'c:/Users/dell/Desktop/Eagle-Revolution/src/src/data/completeData.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Update the root services object
data.services.hero = {
    headline: {
        prefix: "St. Louis's Trusted",
        highlight: "Exterior Remodeling",
        suffix: "Company"
    },
    description: [
        "Eagle Revolution provides expert exterior remodeling services for homes and businesses. From windows and doors to roofing and decks, our team delivers quality craftsmanship with military precision.",
        "<span class=\"font-semibold text-primary\">Veteran Owned • Licensed • Bonded & Insured</span>"
    ]
};

data.services.statsSection = {
    badge: "Our Impact",
    headline: "Trusted by Homeowners <span class=\"text-primary\">Across the Region</span>",
    description: "Numbers speak louder than words. Here's what we've achieved together with our valued customers."
};

data.services.gridSection = {
    badge: "Expertise",
    headline: "World Class <span class=\"text-primary\">Capabilities</span>",
    description: "Every detail matters when it comes to structural integrity. Our team brings military-grade standards to every project across the St. Louis area."
};

fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
console.log("SUCCESS: Updated services structure in completeData.json");
