const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env.local") });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
  const db = mongoose.connection.db;
  const pages = await db.collection("pages").find({ isTrashed: { $ne: true } }).toArray();

  const missingParent = [];
  pages.forEach(p => {
    if (["state", "city"].includes(p.template)) {
      if (!p.content || !p.content.parentLocationId) {
        missingParent.push({
          _id: p._id,
          title: p.title,
          template: p.template,
          slug: p.slug
        });
      }
    }
  });

  console.log("Location pages missing parentLocationId:", missingParent);
  await mongoose.disconnect();
}
check();
