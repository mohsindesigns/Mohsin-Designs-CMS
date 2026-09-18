const mongoose = require("mongoose");
const MONGODB_URI = "mongodb://mdseo_user:mD%26tEam%2FmDs-2026!@127.0.0.1:27017/mdseo2025?authSource=mdseo2025";

function buildDisplayRows(list) {
  const byId = new Map();
  const bySlug = new Map();

  list.forEach((p) => {
    byId.set(String(p._id), p);
    if (p.slug) bySlug.set(p.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, ""), p);
  });

  const childrenOf = new Map();
  const parentOf = new Map();
  const childIds = new Set();

  list.forEach((p) => {
    const pId = String(p._id);
    let resolvedParent = null;

    const parentLocId = p.content?.parentLocationId ? String(p.content.parentLocationId) : null;
    if (parentLocId && parentLocId !== pId) {
      if (byId.has(parentLocId)) {
        resolvedParent = byId.get(parentLocId);
      }
    }

    if (!resolvedParent && p.slug && p.slug.includes("/")) {
      const parts = p.slug.split("/").filter(Boolean);
      if (parts.length > 1) {
        const parentSlug = parts.slice(0, -1).join("/").toLowerCase();
        if (bySlug.has(parentSlug)) {
          resolvedParent = bySlug.get(parentSlug);
        }
      }
    }

    if (resolvedParent && String(resolvedParent._id) !== pId) {
      const parentKey = String(resolvedParent._id);
      if (!childrenOf.has(parentKey)) childrenOf.set(parentKey, []);
      childrenOf.get(parentKey).push(p);
      parentOf.set(pId, resolvedParent);
      childIds.add(pId);
    }
  });

  for (const [_, childList] of childrenOf) {
    childList.sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { numeric: true, sensitivity: "base" }));
  }

  const rows = [];
  const seen = new Set();

  const appendPageAndChildren = (page, depth, parent) => {
    const pId = String(page._id);
    if (seen.has(pId)) return;
    seen.add(pId);

    const directChildren = childrenOf.get(pId) || [];
    const tier = depth === 0 ? "root" : depth === 1 ? "child" : "subchild";

    rows.push({
      _id: pId,
      title: page.title,
      slug: page.slug,
      template: page.template,
      depth,
      parentTitle: parent?.title,
      parentSlug: parent?.slug,
      tier,
      directChildCount: directChildren.length
    });

    directChildren.forEach((child) => {
      appendPageAndChildren(child, depth + 1, page);
    });
  };

  const roots = [];
  list.forEach((p) => {
    if (!childIds.has(String(p._id))) roots.push(p);
  });

  roots.sort((a, b) => {
    const isCountryA = a.template === "country";
    const isCountryB = b.template === "country";
    if (isCountryA && !isCountryB) return -1;
    if (!isCountryA && isCountryB) return 1;
    return (a.title || "").localeCompare(b.title || "");
  });

  roots.forEach((root) => appendPageAndChildren(root, 0));

  return rows;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const pages = await mongoose.connection.db.collection("pages").find({ isTrashed: { $ne: true } }).toArray();

  console.log("Total DB pages:", pages.length);
  const rows = buildDisplayRows(pages);
  console.log("Total Tree rows built:", rows.length);

  console.log("\n--- SAMPLE WORDPRESS-STYLE HIERARCHY TREE PREVIEW ---");
  rows.slice(0, 35).forEach((r) => {
    const prefix = r.depth === 0 ? "" : r.depth === 1 ? "— " : "— — ";
    const indent = "  ".repeat(r.depth);
    const parentTag = r.parentTitle ? ` [Parent: ${r.parentTitle}]` : "";
    const childTag = r.directChildCount > 0 ? ` (${r.directChildCount} children)` : "";
    console.log(`${indent}${prefix}${r.title} | ${r.tier.toUpperCase()} | /${r.slug}/${parentTag}${childTag}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
