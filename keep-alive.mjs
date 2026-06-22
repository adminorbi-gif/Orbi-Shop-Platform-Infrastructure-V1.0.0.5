/**
 * Self Keep-Alive Script
 * This script periodically pings your application URLs to prevent 
 * cloud hosting services (like Render, Heroku, or unoptimized VMs) 
 * from putting your app to sleep.
 */

import https from 'https';
import http from 'http';

// The URLs you want to keep alive
const targetUrls = [
  'https://shop.orbifinancial.com',
  'https://pay.orbifinancial.com'
];

// Ping interval in milliseconds (e.g., 10 minutes)
// Most free tiers sleep after 15 minutes of inactivity
const INTERVAL_MS = 5 * 60 * 1000;

function ping() {
  targetUrls.forEach(url => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      console.log(`[${new Date().toISOString()}] SUCCESS - Pinged ${url} (Status: ${res.statusCode})`);
    }).on('error', (err) => {
      console.error(`[${new Date().toISOString()}] ERROR - Failed to ping ${url}:`, err.message);
    });
  });
}

console.log(`Starting keep-alive script...`);
console.log(`URLs to ping:\n - ${targetUrls.join('\n - ')}`);
console.log(`Interval: ${INTERVAL_MS / 1000 / 60} minutes\n`);

// 1. Initial ping on load
ping();

// 2. Schedule regular pings
setInterval(ping, INTERVAL_MS);
