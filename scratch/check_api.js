async function testHome() {
  const r = await fetch('http://localhost:3000/');
  const html = await r.text();
  console.log('Homepage status:', r.status);
  console.log('Homepage contains id="contact":', html.includes('id="contact"'));
  console.log('Homepage contains "GET IN TOUCH":', html.includes('GET IN TOUCH'));
}
testHome();
