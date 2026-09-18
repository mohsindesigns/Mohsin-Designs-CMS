const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env.local") });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
  const db = mongoose.connection.db;
  const pages = await db.collection("pages").find({ isTrashed: { $ne: true } }).toArray();
  let withParent = 0;
  let withoutParent = 0;
  pages.forEach(p => {
    if (p.content && p.content.parentLocationId) withParent++;
    else withoutParent++;
  });
  console.log({ total: pages.length, withParent, withoutParent });
  const samples = pages.filter(p => ["country", "state", "city"].includes(p.template)).slice(0, 10).map(p => ({
    title: p.title,
    template: p.template,
    slug: p.slug,
    parentLocationId: p.content && p.content.parentLocationId,
    parentType: typeof (p.content && p.content.parentLocationId)
  }));
  console.log("Sample location pages:", samples);
  await mongoose.disconnect();
}
check();
