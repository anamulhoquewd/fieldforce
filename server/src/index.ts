import { serve } from "@hono/node-server";
import dotenv from "dotenv";
import { Hono } from "hono";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

console.log(`Starting server on port ${PORT}...`);
serve(
  {
    fetch: app.fetch,
    port: Number(PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
