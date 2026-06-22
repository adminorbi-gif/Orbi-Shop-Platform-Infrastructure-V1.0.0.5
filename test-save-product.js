import fetch from 'node-fetch';

async function test() {
  const payload = {
    id: "PRD-test-" + Date.now(),
    name: "Test Cloudflare Product",
    sku: "TEST-SKU-1234",
    niche: "Electronics",
    category: "Phones",
    price: 150000,
    stock: 5,
    description: "Testing Cloudflare image saving",
    images: ["https://example-r2-public-url.com/products/test-image.webp"],
    visible: true,
    tags: ["test", "r2"]
  };

  try {
    const res = await fetch('http://localhost:3000/api/v1/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

test();
