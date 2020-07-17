import axios from "axios";

// VATSIM APIs
export const getVatsimData = async () => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/vatsim-data`).then(
    (res) => res.data
  );
};

export const getDecodedFlightRoute = async (origin, route, destination) => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/decodeRoute`, {
    params: {
      origin,
      route,
      destination,
    },
  }).then((res) => res.data);
};

export const getWeather = async () => {
  return await axios("https://api.rainviewer.com/public/maps.json").then(
    (res) => res.data
  );
};
