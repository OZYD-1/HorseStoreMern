import app from "./app.js";
import env from "./config/env.js";
import { connectDB } from "./config/database.js";

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`HorseStore API running on http://localhost:${env.port}`);
    console.log(`Environment: ${env.nodeEnv}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
