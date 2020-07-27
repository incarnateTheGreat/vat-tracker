const express = require("express");
const app = express();
const cors = require("cors");
const request = require("request");

require("dotenv").config();

// Enable cross-origin resource sharing.
app.use(cors());

app.listen(8000, () => {
  console.log("Express server started!");
});

const VAT_STATUS_BASE_URL = "https://beta-api.vatstats.net/external_api";

// app.use("/api/metar/:metar", (req, res) => {
//   const metar = req.params["metar"].toUpperCase();

//   request(
//     `http://metar.vatsim.net/metar.php?id=${metar}`,
//     (error, response, body) => {
//       if (body.includes("No METAR available")) {
//         res.send(null);
//       } else {
//         res.send(body);
//       }
//     }
//   );
// });

app.use("/api/flights", (req, res) => {
  const options = {
    url: `${VAT_STATUS_BASE_URL}/home_page/`,
    method: "GET",
  };

  request(options, (error, response, body) => {
    body ? res.send(body) : res.send(null);
  });
});

app.use("/api/flight", (req, res) => {
  const { id } = req.query;

  const options = {
    url: `${VAT_STATUS_BASE_URL}/flights/${id}/?format=json`,
    method: "GET",
  };

  request(options, (error, response, body) => {
    body ? res.send(body) : res.send(null);
  });
});

app.use("/api/airports", (req, res) => {
  const { icao } = req.query;

  const options = {
    url: `${VAT_STATUS_BASE_URL}/airports/?icao__icontains=${icao}`,
    method: "GET",
  };

  request(options, (error, response, body) => {
    body ? res.send(body) : res.send(null);
  });
});

app.use("/api/airport", (req, res) => {
  const { id } = req.query;

  const options = {
    url: `${VAT_STATUS_BASE_URL}/airports/${id}/`,
    method: "GET",
  };

  request(options, (error, response, body) => {
    body ? res.send(body) : res.send(null);
  });
});

// TODO: DECIDE WHETHER OR NOT TO KEEP THIS.
app.use("/api/decode-route", (req, res) => {
  const { origin, route, destination } = req.query;

  // Join strings together, remove commas and replace them with spaces.
  const routeStr = [origin, route, destination]
    .join(",")
    .match(/[^ ,]+/g)
    .join(" ");

  const options = {
    url: "https://api.flightplandatabase.com/auto/decode",
    method: "POST",
    form: { route: routeStr },
    headers: {
      Authorization: "Basic EEX0ovsK0oa4SDYT1g4XqOOZEnKvU6e9yj0ZhX9Q",
    },
  };

  // ****** DEVELOPMENT USE ONLY! REMOVE WHEN IN PRODUCTION *******
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

  request(options, (error, response, body) => {
    body ? res.send(body) : res.send(null);
  });
});

app.use("/api/fetch-route", (req, res) => {
  const { id } = req.query;

  const options = {
    url: `https://api.flightplandatabase.com/plan/${id}`,
    method: "GET",
    headers: {
      Authorization: "Basic EEX0ovsK0oa4SDYT1g4XqOOZEnKvU6e9yj0ZhX9Q",
    },
  };

  // ****** DEVELOPMENT USE ONLY! REMOVE WHEN IN PRODUCTION *******
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

  request(options, (error, response, body) => {
    body ? res.send(body) : res.send(null);
  });
});
