import axios from "axios";

// VATSIM APIs
export const getVatsimData = async (isInit = false) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/vatsimJson/`, {
    params: {
      isInit,
    },
  }).then((res) => res.data);
};

export const getDecodedFlightRoute = async (origin, route, destination) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/decode-route`, {
    params: {
      origin,
      route,
      destination,
    },
  }).then((res) => res.data);
};

export const fetchRoute = async (id) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/fetch-route`, {
    params: {
      id,
    },
  }).then((res) => res.data);
};

export const getWeather = async () => {
  return await axios("https://api.rainviewer.com/public/maps.json").then(
    (res) => res.data
  );
};

export const getTAF = async (icao) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/taf`, {
    params: {
      icao,
    },
  }).then((res) => res.data);
};

export const getMETAR = async (icao) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/metar`, {
    params: {
      icao,
    },
  }).then((res) => res.data);
};

// Experimental VatStats
// export const getFlights = async () => {
//   return await axios(`${process.env.REACT_APP_LOCALHOST}/api/flights`).then(
//     (res) => res.data
//   );
// };

// export const getControllers = async () => {
//   return await axios(`${process.env.REACT_APP_LOCALHOST}/api/controllers`).then(
//     (res) => res.data
//   );
// };

// Get a list of Airports based on a substring
export const getAirports = async (icao) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/airports`, {
    params: {
      icao,
    },
  }).then((res) => res.data);
};

// Get an Airport via its Vat-Stats ID.
export const getAirport = async (id) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/airport`, {
    params: {
      id,
    },
  }).then((res) => res.data);
};

// Get all FIRs.
export const getFIRs = async () => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/firs`).then(
    (res) => res.data
  );
};

// Get all ATC connections.
export const getATC = async () => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/atc`).then(
    (res) => res.data
  );
};

// Get all Approach coonections..
export const getApproach = async () => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/approach`).then(
    (res) => res.data
  );
};

// Get Flight Data from Vat-Stats.
export const getFlight = async (id) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/flight`, {
    params: {
      id,
    },
  }).then((res) => res.data);
};

export const getFlightVatStats = async (callsign) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/flightVatStats`, {
    params: {
      callsign,
    },
  }).then((res) => res.data);
};
