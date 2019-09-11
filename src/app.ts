import express from "express";
import compression from "compression"; // compress requests
import bodyParser from "body-parser";
import dotenv from "dotenv";
import session from "express-session";
import cron from "node-cron";

import router from "./routes";
import { client, updateRedis } from "./util/redis.utils";

dotenv.config();

const app = express();
const expressSwagger = require("express-swagger-generator")(app);

// Configuration
app.use(session({
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
  resave: false,
  saveUninitialized: true,
  secret: "ygDe7*1d@Z%PJLXE6FBGli5mN!%v^E",
  // store: new RedisStore(),
}));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("port", 3000);

client.on("error", (error: any) => {
  console.error(error);
});

client.on("connect", async () => {
  await updateRedis();
});

// set cron jobs to run daily/weekly
cron.schedule("0 0 0 * * *", async () => {
  console.log("Running cron job");
  await updateRedis();
});

// Prefixed routes
app.use("/api/v1", router);

// Swagger
const options = {
  swaggerDefinition: {
    info: {
      description: "Koodisto microservice",
      title: "koodisto-service",
      version: "1.0.0",
    },
    host: "koodisto.aoe.fi",
    basePath: "/api/v1",
    produces: [
      "application/json"
    ],
    schemes: ["https"]
  },
  basedir: __dirname, // app absolute path
  files: ["./routes.js"] // Path to the API handle folder
};
expressSwagger(options);

export default app;
