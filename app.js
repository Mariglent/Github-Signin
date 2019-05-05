// save environment variables in dotenv
require("dotenv").config();

// express set up, handles request, response easily
const express = require("express");
const app = express();

// express session
const session = require("express-session");

// makes sending requests easy
const request = require("request");

// node core module, construct query string
const qs = require("querystring");

// node core module, parses url string into components
const url = require("url");

// generates a random string for the
const randomString = require("randomstring");

// random string, will be used in the workflow later
const csrfString = randomString.generate();

// setting up port and redirect url from process.env
// makes it easier to deploy later
const port = process.env.PORT || 3000;
const redirect_uri = process.env.HOST + "/redirect";

// serves up the contnests of the /views folder as static
app.use(express.static("views"));

// initializes session
app.use(
  session({
    secret: randomString.generate(),
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
  })
);

app.get("/", (req, res, next) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log("Server listening at port " + port);
});

app.get("/login", (req, res, next) => {
  // generate that csrf_string for your "state" parameter
  req.session.csrf_string = randomString.generate();
  // construct the GitHub URL you redirect your user to.
  // qs.stringify is a method that creates foo=bar&bar=baz
  // type of string for you.
  const githubAuthUrl =
    "https://github.com/login/oauth/authorize?" +
    qs.stringify({
      client_id: process.env.CLIENT_ID,
      redirect_uri: redirect_uri,
      state: req.session.csrf_string,
      scope: "user:email"
    });
  // redirect user with express
  res.redirect(githubAuthUrl);
});
