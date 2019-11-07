import express, { NextFunction } from "express";
import compression from "compression";  // compresses requests
import lusca from "lusca";
import dotenv from "dotenv";
import path from "path";
const util = require("util");
import expressValidator from "express-validator";
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

const ah = require("./queries/authservice");
// API keys and Passport configuration
// import * as passportConfig from "./config/passport";

const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");

import * as homeController from "./controllers/home";
const apiRouter = require("./routes/routes");
// Create Express server


// setInterval(() => ah.authIssuer(), 30000);
const Issuer  = require("openid-client").Issuer;
const Strategy = require("openid-client").Strategy;

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: "bla bla bla"
}));

// One possible implementation below.
// ** STARTS HERE **
// Issuer.discover("https://test-user-auth.csc.fi")
//     .then(function (testIssuer) {
//         console.log("Discovered issuer %s", testIssuer);
//         const client = new testIssuer.Client({
//             client_id: "bfb7ab6dda3f493fb321233a7e55953f965391ec",
//             client_secret: "ba761d78e42754edb2853fcaca8497acc54f8d05"
//         });
//         client.authorizationUrl({
//             redirect_uri: "https://10.10.10.10:3000/secure/redirect",
//             scope: "openid email profile",
//         });
//         client.Callback("https://10.10.10.10:3000/secure/redirect")
//             .then(function (tokenSet) {
//                 console.log("received and validated tokens %j", tokenSet);
//                 console.log("validated id_token claims %j", tokenSet.claims);
//             });
//         passport.use("oidc", new Strategy({client}, (tokenset: any, userinfo: any, done: any) => {
//             console.log("tokenset", tokenset);
//             console.log("access_token", tokenset.access_token);
//             console.log("id_token", tokenset.id_token);
//             console.log("claims", tokenset.claims);
//             console.log("userinfo", userinfo);
//             User.findOne({ id: tokenset.claims.sub}, function (err, user) {
//                 if (err) return done(err);
//                 return done(undefined, user);
//         });

//     }));
//     console.log("The actual client " + JSON.stringify(client));
//     // console.log("The client auth url " + JSON.stringify(client.authorizationUrl));
// });


// app.get("/secure/redirect", passport.authenticate("oidc", {successRedirect: "/", failureRedirect: "/login"}));
// ** ENDS HERE **


// One possible implementation below.
// ** STARTS HERE **
Issuer.discover("https://test-user-auth.csc.fi")
    .then( function(testIssuer) {
        const client = new testIssuer.Client({
            client_id: "bfb7ab6dda3f493fb321233a7e55953f965391ec",
            client_secret: "ba761d78e42754edb2853fcaca8497acc54f8d05",
            redirect_uri: "https://10.10.10.10:3000/secure/redirect",
            response_type: "code",
        });
        console.log("Discovered issuer %s %O", testIssuer.issuer, testIssuer.metadata);
        passport.use("oidc", new Strategy({ client }, (tokenset: any, userinfo: any, done: any) => {
           // **NEVER GET HERE**
            console.log("tokenset", tokenset);
            console.log("access_token", tokenset.access_token);
            console.log("id_token", tokenset.id_token);
            console.log("claims", tokenset.claims);
            console.log("userinfo", userinfo);
        }));
    });
    app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


// app.get("/", (req, res) => {
//     // console.log("The req: " + util.inspect(req) + " and user " + req.user);
//     res.json({"hello": "world", "user": "test" + JSON.stringify(req.body)});
//     console.log(util.inspect(req));
// });


app.get("/login", passport.authenticate("oidc", {successRedirect: "/", failureRedirect: "/login", failureFlash: true, scope: "openid profile"}));
app.get("/secure/redirect", passport.authenticate("oidc", {"callback": true, failureRedirect: "/", failureFlash: true, successRedirect: "/"}));












// Connect to MongoDB
// const apiRouter = require("./routes/routes");
const cookieParser = require("cookie-parser");
// app.use(passport.initialize());
// app.use(passport.session());
// Express configuration
app.use(cookieParser());
app.use(morgan("dev"));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("port", 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.get("/", homeController.index);
app.use("/", apiRouter);
app.use(expressValidator);
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