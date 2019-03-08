import express from "express";
import compression from "compression"; // compress requests
import bodyParser from "body-parser";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";

import router from "./routes";

import { setYso } from "./controllers/finto";
import { setOpetussuunnitelmat } from "./controllers/eperusteet-amosaa";
import { setLukionkurssit } from "./controllers/eperusteet-koodisto";

dotenv.config();

const app = express();

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
app.use(cors()); // Enable CORS for dev purposes
app.set("port", 3000);

// Init
// set data to redis (if not already set)
app.on("listening", async () => {
  await setYso();
  await setOpetussuunnitelmat();
  await setLukionkurssit();
});

// set cron jobs to run daily/weekly

// Prefixed routes
app.use("/api/v1", router);

export default app;
