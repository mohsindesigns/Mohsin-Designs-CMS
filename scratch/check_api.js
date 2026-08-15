async function checkApi() {
  const res = await fetch("http://localhost:3000/api/content");
  const data = await res.json();
  const services = data.services.services;
  console.log(`API Services (${services.length}):`);
  services.forEach(s => {
    console.log(`- ${s.slug} (${s.status})`);
  });
}

checkApi().catch(console.error);
