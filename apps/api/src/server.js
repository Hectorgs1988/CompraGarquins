import app from "./app.js";
import { env } from "./config/env.js";
import { bootstrapDb } from "./db/bootstrap.js";

async function start() {
  try {
    await bootstrapDb();
    app.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Error starting API", error);
    process.exit(1);
  }
}

start();
