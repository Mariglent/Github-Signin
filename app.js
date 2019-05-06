require("dotenv").config();
const express = require("express");
const server = express();
const app = express();
const session = require("express-session");
const request = require("request");
const qs = require("querystring");
const url = require("url");
const randomString = require("randomstring");
const csrfString = randomString.generate();
const port = process.env.PORT || 3000;
const redirect_uri = process.env.HOST + "/redirect";
app.use(express.static("views"));

app.get("/login", (req, res, next) => {
  req.session.csrf_string = randomString.generate();

  const githubAuthUrl =
    "https://github.com/login/oauth/authorize?" +
    qs.stringify({
      client_id: process.env.CLIENT_ID,
      redirect_uri: redirect_uri,
      state: req.session.csrf_string,
      scope: "user:email"
    });
  res.redirect(githubAuthUrl);
});

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

app.all("/redirect", (req, res) => {
  console.log("Request sent by GitHub: ");
  console.log(req.query);

  const code = req.query.code;
  const returnedState = req.query.state;

  if (req.session.csrf_string === returnedState) {
    request.post(
      {
        url:
          "https://github.com/login/oauth/access_token?" +
          qs.stringify({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: code,
            redirect_uri: redirect_uri,
            state: req.session.csrf_string
          })
      },

      (error, response, body) => {
        console.log("Your Access Token: ");
        console.log(qs.parse(body));
        req.session.access_token = qs.parse(body).access_token;
        res.redirect("/user");
      }
    );
  } else {
    res.redirect("/");
  }
});
