import express from "express";
import compression from "compression"; // compress requests
import bodyParser from "body-parser";
import dotenv from "dotenv";

import * as eperusteetKoodisto from "./controllers/eperusteet-koodisto";

dotenv.config();

const app = express();

app.set("port", 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/testi", eperusteetKoodisto.getTesti);
app.get("/lukionkurssit", eperusteetKoodisto.getLukionkurssit);

export default app;
