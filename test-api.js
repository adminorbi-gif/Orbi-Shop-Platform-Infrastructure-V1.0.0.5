import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/v1/orders');
  const json = await res.json();
  console.log("Orders count:", json.data?.length);
  console.log("First order ID:", json.data?.[0]?.id);
  console.log("Unique IDs count:", new Set((json.data||[]).map(o => o.id)).size);

  const res2 = await fetch('http://localhost:3000/api/v1/campaigns/billboards');
  const json2 = await res2.json();
  console.log("Billboards fetch success:", json2.success);

  const res3 = await fetch('http://localhost:3000/api/v1/customers');
  const json3 = await res3.json();
  console.log("Customers fetch success:", json3.success, "Data item count:", json3.data?.length);

  const res4 = await fetch('http://localhost:3000/api/v1/settings/staff');
  const json4 = await res4.json();
  console.log("Staff fetch success:", json4.success, "Data item count:", json4.data?.length);
}
test();
