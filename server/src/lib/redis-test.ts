import { redis } from "./redis.js";

async function main() {
  // ১. ping — server জীবিত কিনা
  const pong = await redis.ping();
  console.log("PING →", pong); // "PONG" আসা উচিত

  // ২. set — একটা মান রাখো
  await redis.set("hello", "FieldForce");
  console.log("SET hello = FieldForce");

  // ৩. get — ফেরত আনো
  const value = await redis.get("hello");
  console.log("GET hello →", value); // "FieldForce" আসা উচিত

  // ৪. delete — মুছে ফেলো
  await redis.del("hello");
  console.log("DEL hello ✓");

  await redis.quit(); // সংযোগ বন্ধ করো, নইলে script ঝুলে থাকবে
}

main().catch(console.error);