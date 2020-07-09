import axios from "axios";

// VATSIM APIs
export const getVatsimData = async () => {
  return await axios(`${process.env.REACT_APP_LOCALHOST}/api/vatsim-data`).then(
    (res) => res.data
  );
};
