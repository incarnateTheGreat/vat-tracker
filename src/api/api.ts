import axios from "axios";

// VATSIM APIs
export const getVatsimData = async (isInit = false) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/vatsim-data/`, {
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
  }).then((res) => {
    console.log(res.data);
  });
};

export const getWeather = async () => {
  return await axios("https://api.rainviewer.com/public/maps.json").then(
    (res) => res.data
  );
};

// Experimental VatStats
export const getFlights = async () => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/flights`).then(
    (res) => res.data
  );
};

export const getFlight = async (id) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/flight`, {
    params: {
      id,
    },
  }).then((res) => res.data);
};
