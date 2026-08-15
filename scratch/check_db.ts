import connectToDatabase from "../src/lib/mongodb";
import SiteContent from "../src/models/Content";

async function checkSlugs() {
  await connectToDatabase();
  const content = await SiteContent.findOne({ key: "complete_data" });
  if (!content) {
    console.log("No complete_data found");
    return;
  }
  const services = content.data.services.services;
  console.log("Registered Service Slugs:");
  services.forEach(s => {
    console.log(`- ${s.slug} (Status: ${s.status})`);
  });
  process.exit(0);
}

checkSlugs();
