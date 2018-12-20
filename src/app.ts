import express from "express";
import compression from "compression"; // compress requests
import bodyParser from "body-parser";

import * as eperusteetKoodisto from "./controllers/eperusteet-koodisto";

const app = express();

app.set("port", 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/testi", eperusteetKoodisto.getTesti);

export default app;
