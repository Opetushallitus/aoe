import express, { NextFunction } from "express";
import compression from "compression";  // compresses requests
import lusca from "lusca";
import dotenv from "dotenv";
import path from "path";
import expressValidator from "express-validator";
// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

const flash = require("express-flash");

// API keys and Passport configuration
// import * as passportConfig from "./config/passport";
const cors = require("cors");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");

import * as homeController from "./controllers/home";
const apiRouter = require("./routes/routes");
// Create Express server




// Connect to MongoDB
// const apiRouter = require("./routes/routes");
const cookieParser = require("cookie-parser");

// Express configuration
app.use(cookieParser());
app.use(morgan("dev"));
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("port", 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.get("/", homeController.index);
app.use("/", apiRouter);
app.use(expressValidator);
app.use(flash);
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection);

/**
 * API examples routes.
 */
// app.get("/api", apiController.getApi);
// app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

// /**
//  * OAuth authentication routes. (Sign in)
//  */
// app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
// app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
//   res.redirect(req.session.returnTo || "/");
// });
module.exports = app;
export default app;