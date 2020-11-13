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

app.use("/api/taf", (req, res) => {
  const { icao } = req.query;

  const options = {
    url: `https://avwx.rest/api/taf/${icao}?options=summary&airport=true&reporting=true&format=json&onfail=cache`,
    method: "GET",
    headers: {
      Authorization: "kwPLOxkqMaHfwkKNPWmRZgsiN58T8M-Z6X2S4yfmv84",
    },
  };

  request(options, (error, response, body) => {
    body ? res.send(body) : res.send(null);
  });
});

app.use("/api/metar", (req, res) => {
  const { icao } = req.query;

  const options = {
    url: `https://api.metarreader.com/web/weather/${icao}`,
    method: "GET",
  };

  request(options, (error, response, body) => {
    body ? res.send(body) : res.send(null);
  });
});

app.use("/api/vatsimJson", (req, res) => {
  const options = {
    url: "http://eu.data.vatsim.net/vatsim-data.json",
    method: "GET",
  };

  request(options, (error, response, body) => {
    if (body) {
      const parsed = JSON.parse(body);

      const flights = parsed.clients
        .filter((user) => user.clienttype !== "ATC")
        .reduce((r, acc) => {
          r.push(acc);

          return r;
        }, [])
        .sort((a,b) => {
          return a['callsign'].localeCompare(b['callsign']);
        })

      const controllers = parsed.clients
        .filter((user) => user.clienttype === "ATC")
        .reduce((r, acc) => {
          acc["isController"] = true;

          r.push(acc);

          return r;
        }, [])
        .sort((a,b) => {
          return a['callsign'].localeCompare(b['callsign']);
        })

      return res.send({flights, controllers});
    } else {
      res.send([]);
    }
  });
});

app.use("/api/flightVatStats", (req, res) => {
  const { callsign } = req.query;

  const options = {
    url: `${VAT_STATUS_BASE_URL}/flights/?callsign__icontains=&callsign=${callsign}&callsign__contains=&real_name=&real_name__icontains=&format=json`,
    method: "GET",
  };

  request(options, (error, response, body) => {

    if (body) {
      const parsed = JSON.parse(body);

      const selectedFlight = parsed.results
        .filter((flight) => flight.status === 1)

      if (selectedFlight) {
        return res.send(...selectedFlight);
      }

      return res.send([])
    } else {
      res.send([]);
    }
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

app.use("/api/firs", (req, res) => {
  const options = {
    url: `https://simaware.ca/api/onlineatc`,
    method: "GET",
  };

  request(options, (error, response, body) => {
    body ? res.send(body) : res.send(null);
  });
});

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
      Authorization: `Basic ${process.env.ROUTE_TOKEN}`,
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
      Authorization: `Basic ${process.env.ROUTE_TOKEN}`,
    },
  };

  // ****** DEVELOPMENT USE ONLY! REMOVE WHEN IN PRODUCTION *******
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

  request(options, (error, response, body) => {
    body ? res.send(body) : res.send(null);
  });
});
