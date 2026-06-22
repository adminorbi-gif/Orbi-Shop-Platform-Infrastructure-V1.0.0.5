import fetch from 'node-fetch';

async function test() {
  const getRes = await fetch('http://localhost:3000/api/v1/orders');
  const getJson = await getRes.json();
  const firstId = getJson.data[0].id;
  console.log("Will delete:", firstId);
  
  const delRes = await fetch('http://localhost:3000/api/v1/orders/' + firstId, { method: 'DELETE' });
  const delJson = await delRes.json();
  console.log("Delete result:", delJson);

  const getRes2 = await fetch('http://localhost:3000/api/v1/orders');
  const getJson2 = await getRes2.json();
  console.log("Orders count remaining:", getJson2.data?.length);
}
test();
