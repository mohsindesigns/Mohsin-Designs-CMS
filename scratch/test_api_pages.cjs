const http = require("http");

http.get("http://127.0.0.1:3007/api/admin/pages", (res) => {
  console.log("Status Code:", res.statusCode);
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log("Is Array?", Array.isArray(json));
      if (Array.isArray(json)) {
        console.log("Total pages returned:", json.length);
        const city = json.find(p => p.template === "city");
        console.log("Sample city fields:", {
          title: city?.title,
          slug: city?.slug,
          parentLocationId: city?.content?.parentLocationId,
          countrySlug: city?.content?.countrySlug,
          stateSlug: city?.content?.stateSlug,
          citySlug: city?.content?.citySlug
        });
        const state = json.find(p => p.template === "state");
        console.log("Sample state fields:", {
          title: state?.title,
          slug: state?.slug,
          parentLocationId: state?.content?.parentLocationId,
          countrySlug: state?.content?.countrySlug,
          stateSlug: state?.content?.stateSlug
        });
        const country = json.find(p => p.template === "country");
        console.log("Sample country fields:", {
          title: country?.title,
          slug: country?.slug,
          countrySlug: country?.content?.countrySlug
        });
      } else {
        console.log("Response:", json);
      }
    } catch(e) {
      console.log("Body:", data);
    }
  });
});
